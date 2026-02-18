import CommunityPost from "../models/CommunityPost.js";
import User from "../models/User.js";

const formatPost = (post) => {
    const plain = post.toObject ? post.toObject({ virtuals: true, flattenMaps: true }) : post;
    const stableId = post._id ? post._id.toString() : (plain._id ? plain._id.toString() : '');

    // Explicitly extract media fields to avoid Map/serialization issues
    const mediaObj = plain.media || {};
    const mediaType = plain.type || (plain.poll ? 'poll' : (mediaObj.video ? 'video' : (mediaObj.image ? 'image' : 'text')));

    return {
        ...plain,
        _id: stableId,
        id: stableId,
        type: mediaType,
        avatar: plain.avatar || "",
        media: {
            image: mediaObj.image || "",
            video: mediaObj.video || "",
            gif: mediaObj.gif || ""
        },
        taggedUsers: plain.taggedUsers || []
    };
};

/* ===============================
   CREATE POST
   =============================== */
export const createPost = async (req, res) => {
    try {
        console.log("DEBUG: createPost req.body:", JSON.stringify(req.body, null, 2));
        const { userId, userName, avatar, text, type, feeling, media, poll, location, taggedUsers } = req.body;

        if (!userId || !userName) {
            return res.status(400).json({
                success: false,
                message: "User ID and Name are required",
            });
        }

        // Format poll options correctly if present
        let formattedPoll = null;
        if (poll && Array.isArray(poll.options)) {
            formattedPoll = {
                question: poll.question,
                options: poll.options.map(opt => ({ text: opt, votes: [] })),
                totalVotes: 0
            };
        }

        const newPost = new CommunityPost({
            userId,
            userName,
            avatar,
            text,
            type: type || (media?.video ? 'video' : (media?.gif ? 'image' : (media?.image ? 'image' : (formattedPoll ? 'poll' : 'text')))),
            feeling,
            media,
            poll: formattedPoll,
            location,
            taggedUsers
        });

        const savedPost = await newPost.save();

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: formatPost(savedPost),
        });
    } catch (error) {
        console.error("❌ CREATE POST ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create post",
            error: error.message,
        });
    }
};

/* ===============================
   GET ALL POSTS
   =============================== */
export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const posts = await CommunityPost.aggregate([
            { $sort: { timestamp: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $addFields: {
                    avatar: { $ifNull: [{ $arrayElemAt: ["$userDetails.avatar", 0] }, "$avatar"] }
                }
            },
            { $project: { userDetails: 0 } }
        ]);

        const total = await CommunityPost.countDocuments();

        // formatPost handles aggregation results too
        return res.status(200).json({
            success: true,
            count: posts.length,
            total,
            data: posts.map(formatPost),
        });
    } catch (error) {
        console.error("❌ GET POSTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message,
        });
    }
};

/* ===============================
   LIKE POST
   =============================== */
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // User who is liking/unliking

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const post = await CommunityPost.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const index = post.likes.indexOf(userId);
        if (index === -1) {
            // Like
            post.likes.push(userId);
        } else {
            // Unlike
            post.likes.splice(index, 1);
        }

        await post.save();

        return res.status(200).json({
            success: true,
            message: index === -1 ? "Post liked" : "Post unliked",
            likesCount: post.likes.length,
            likes: post.likes,
        });
    } catch (error) {
        console.error("❌ LIKE POST ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to like post",
            error: error.message,
        });
    }
};

/* ===============================
   ADD COMMENT
   =============================== */
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName, text } = req.body;

        if (!userId || !userName || !text) {
            return res.status(400).json({ success: false, message: "User info and text required" });
        }

        const post = await CommunityPost.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const newComment = {
            userId,
            userName,
            text,
            timestamp: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Get the last comment (the one we just added) to get the generated _id
        const savedComment = post.comments[post.comments.length - 1];
        const plainComment = savedComment.toObject ? savedComment.toObject() : savedComment;

        return res.status(201).json({
            success: true,
            message: "Comment added",
            data: {
                ...plainComment,
                _id: savedComment._id.toString(),
                id: savedComment._id.toString()
            },
            totalComments: post.comments.length
        });
    } catch (error) {
        console.error("❌ ADD COMMENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: error.message,
        });
    }
};
/* ===============================
   SEARCH POSTS & USERS
   =============================== */
export const searchPosts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json({ success: true, data: { posts: [], users: [] } });
        }

        // Search posts with latest avatar
        const posts = await CommunityPost.aggregate([
            { $match: { text: { $regex: q, $options: "i" } } },
            { $sort: { timestamp: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $addFields: {
                    avatar: { $ifNull: [{ $arrayElemAt: ["$userDetails.avatar", 0] }, "$profileImageUrl"] }
                }
            },
            { $project: { userDetails: 0 } }
        ]);

        // Search users
        const users = await User.find({
            name: { $regex: q, $options: "i" }
        }).limit(10).select("name avatar");

        return res.status(200).json({
            success: true,
            data: {
                posts: posts.map(formatPost),
                users: users.map(u => ({
                    _id: u._id,
                    name: u.name,
                    avatar: u.avatar || ""
                }))
            }
        });
    } catch (error) {
        console.error("❌ SEARCH ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to search",
            error: error.message,
        });
    }
};

/* ===============================
   UPLOAD MEDIA
   =============================== */
export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        return res.status(200).json({
            success: true,
            url: req.file.location,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error("❌ UPLOAD MEDIA ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload media",
            error: error.message
        });
    }
};

/* ===============================
   VOTE POLL
   =============================== */
export const votePoll = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, optionId } = req.body;

        console.log(`DEBUG: votePoll id=${id}, userId=${userId}, optionId=${optionId}`);

        if (!userId || !optionId) {
            return res.status(400).json({ success: false, message: "User ID and Option ID required" });
        }

        const post = await CommunityPost.findById(id);
        if (!post || !post.poll) {
            return res.status(404).json({ success: false, message: "Poll not found" });
        }

        // Check if user already voted in this poll
        let hasVoted = false;
        post.poll.options.forEach(opt => {
            if (opt.votes && Array.isArray(opt.votes) && opt.votes.includes(userId)) {
                hasVoted = true;
            }
        });

        if (hasVoted) {
            return res.status(400).json({ success: false, message: "User already voted" });
        }

        // Add vote
        // Try matching by _id or index if optionId is numeric or matching text as fallback? 
        // No, let's stick to _id but be careful with types.
        const optionIndex = post.poll.options.findIndex(opt =>
            opt._id?.toString() === optionId || opt.id?.toString() === optionId
        );

        if (optionIndex === -1) {
            console.warn(`DEBUG: Option not found for id ${optionId}. Options:`, JSON.stringify(post.poll.options));
            return res.status(404).json({ success: false, message: "Option not found" });
        }

        if (!post.poll.options[optionIndex].votes) {
            post.poll.options[optionIndex].votes = [];
        }

        post.poll.options[optionIndex].votes.push(userId);
        post.poll.totalVotes = (post.poll.totalVotes || 0) + 1;

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Vote recorded",
            data: {
                ...post.poll.toObject(),
                userVotedOptionId: optionId
            }
        });

    } catch (error) {
        console.error("❌ VOTE POLL ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to vote",
            error: error.message
        });
    }
};
