import Story from "../models/Story.js";

/**
 * @desc    Create a new story
 * @route   POST /api/stories
 * @access  Private
 */
export const createStory = async (req, res) => {
    try {
        const { userId, userName, userAvatar, media } = req.body;

        if (!userId || !userName || !media || !media.url) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, userName, and media.url are required",
            });
        }

        const newStory = new Story({
            userId,
            userName,
            userAvatar,
            media
        });

        const savedStory = await newStory.save();

        return res.status(201).json({
            success: true,
            message: "Story created successfully",
            data: savedStory,
        });
    } catch (error) {
        console.error("❌ CREATE STORY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create story",
            error: error.message,
        });
    }
};

/**
 * @desc    Get all active stories
 * @route   GET /api/stories
 * @access  Public
 */
export const getStories = async (req, res) => {
    try {
        // Fetch stories with latest user info via aggregation
        const stories = await Story.aggregate([
            { $sort: { createdAt: -1 } },
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
                    userAvatar: {
                        $ifNull: [
                            { $arrayElemAt: ["$userDetails.avatar", 0] },
                            "$userAvatar" // Fallback to stored avatar
                        ]
                    }
                }
            },
            { $project: { userDetails: 0 } }
        ]);

        return res.status(200).json({
            success: true,
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        console.error("❌ GET STORIES ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stories",
            error: error.message,
        });
    }
};
