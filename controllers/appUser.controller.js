import User from "../models/User.js";
import UserInfo from "../models/UserInfo.js";
import CommunityPost from "../models/CommunityPost.js";
import mongoose from "mongoose";

// Helper to find user by ID (handles both String Firebase UID and ObjectId across collections)
const findUserById = async (id) => {
    if (!id) return null;

    // Use .lean() to avoid hydration/validation issues with legacy data
    const UserOld = mongoose.models.UserOld || mongoose.model("UserOld", User.schema, "users");

    const query = async (model) => {
        try {
            // Try direct find with string ID
            let user = await model.findOne({ _id: id }).select("-password").lean();
            if (!user && mongoose.Types.ObjectId.isValid(id)) {
                user = await model.findOne({ _id: new mongoose.Types.ObjectId(id) }).select("-password").lean();
            }
            return user;
        } catch (err) {
            return null;
        }
    };

    let user = await query(UserInfo);
    if (!user) user = await query(User);
    if (!user) user = await query(UserOld);

    return user;
};

/* ===============================
   GET USER PROFILE
   =============================== */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.query.currentUserId;

        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if current user follows this profile
        let isFollowing = false;
        if (currentUserId && currentUserId !== id) {
            isFollowing = Array.isArray(user.followers) && user.followers.map(fid => fid.toString()).includes(currentUserId);
        }

        const followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
        const followingCount = Array.isArray(user.following) ? user.following.length : 0;

        res.status(200).json({
            success: true,
            data: {
                ...user,
                isFollowing,
                followersCount,
                followingCount
            }
        });
    } catch (err) {
        console.error("❌ PROFILE ERROR:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const updateAllUserCollections = async (id, update) => {
    const UserOld = mongoose.models.UserOld || mongoose.model("UserOld", User.schema, "users");
    const models = [User, UserInfo, UserOld];
    const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

    await Promise.all(models.map(model => {
        const query = objectId ? { $or: [{ _id: id }, { _id: objectId }] } : { _id: id };
        return model.updateOne(query, update).catch(err => {
            console.error(`Update failed for ${model.modelName}:`, err);
        });
    }));
};

/* ===============================
   FOLLOW USER
   =============================== */
export const followUser = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        if (userId === targetUserId) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const [user, targetUser] = await Promise.all([
            findUserById(userId),
            findUserById(targetUserId)
        ]);

        if (!user || !targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Add targetUser to user's following
        await updateAllUserCollections(userId, { $addToSet: { following: targetUserId } });

        // Add user to targetUser's followers
        await updateAllUserCollections(targetUserId, { $addToSet: { followers: userId } });

        return res.status(200).json({
            success: true,
            message: "Started following user"
        });
    } catch (error) {
        console.error("❌ FOLLOW ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ===============================
   UNFOLLOW USER
   =============================== */
export const unfollowUser = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const [user, targetUser] = await Promise.all([
            findUserById(userId),
            findUserById(targetUserId)
        ]);

        if (!user || !targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Remove targetUser from user's following
        await updateAllUserCollections(userId, { $pull: { following: targetUserId } });

        // Remove user from targetUser's followers
        await updateAllUserCollections(targetUserId, { $pull: { followers: userId } });

        return res.status(200).json({
            success: true,
            message: "Unfollowed user successfully"
        });
    } catch (error) {
        console.error("❌ UNFOLLOW ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ===============================
   GET USER POSTS
   =============================== */
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await CommunityPost.find({ userId })
            .sort({ timestamp: -1 });

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error("❌ GET USER POSTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user posts"
        });
    }
};

// Helper to find multiple users by IDs across collections (Deduplicated)
const findUsersByIds = async (ids, currentUserId = null) => {
    if (!ids || !ids.length) return [];

    const UserOld = mongoose.models.UserOld || mongoose.model("UserOld", User.schema, "users");
    const formattedIds = ids.map(id => id.toString());
    const objectIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));

    // Use a Map to ensure uniqueness by ID string
    const usersMap = new Map();

    const queryAndMerge = async (model) => {
        try {
            const results = await model.find({
                $or: [
                    { _id: { $in: formattedIds } },
                    { _id: { $in: objectIds } }
                ]
            }).select("name avatar profileImageUrl _id followers").lean();

            results.forEach(u => {
                const idStr = u._id.toString();
                if (!usersMap.has(idStr)) {
                    usersMap.set(idStr, u);
                }
            });
        } catch (err) {
            console.error(`Query error for model ${model.modelName}:`, err);
        }
    };

    // Query in order of priority (most recent first)
    await queryAndMerge(UserInfo);

    // Only query next model if we didn't find everyone yet
    if (usersMap.size < formattedIds.length) {
        await queryAndMerge(User);
    }

    if (usersMap.size < formattedIds.length) {
        await queryAndMerge(UserOld);
    }

    return Array.from(usersMap.values()).map(u => ({
        ...u,
        avatar: u.avatar || u.profileImageUrl || "",
        isFollowing: currentUserId ? (Array.isArray(u.followers) && u.followers.map(f => f.toString()).includes(currentUserId.toString())) : false,
        followers: undefined // Remove sensitive/large array
    }));
};

/* ===============================
   GET FOLLOWERS
   =============================== */
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const followers = await findUsersByIds(user.followers || [], currentUserId);

        return res.status(200).json({
            success: true,
            data: followers
        });
    } catch (error) {
        console.error("❌ GET FOLLOWERS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ===============================
   GET FOLLOWING
   =============================== */
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const following = await findUsersByIds(user.following || [], currentUserId);

        return res.status(200).json({
            success: true,
            data: following
        });
    } catch (error) {
        console.error("❌ GET FOLLOWING ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ===============================
   GET USER BUSINESSES
   =============================== */
export const getUserBusinesses = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const AddBusiness = mongoose.models.AddBusiness || (await import("../models/AddBusiness.js")).default;

        // Try to match by phone numbers or the main ID
        const searchIds = [
            userId,
            user.phone,
            user.phoneNumber,
            user._id?.toString()
        ].filter(Boolean);

        const businesses = await AddBusiness.find({
            "selectedApprovedBusiness.userId": { $in: searchIds },
            status: "approved"
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses
        });
    } catch (error) {
        console.error("❌ GET USER BUSINESSES ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/* ===============================
   UPDATE USER PROFILE
   =============================== */
export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, bio, location, avatar } = req.body;

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const update = {};
        if (name) update.name = name;
        if (bio !== undefined) update.bio = bio;
        if (location !== undefined) update.location = location;
        if (avatar) update.avatar = avatar;

        await updateAllUserCollections(userId, { $set: update });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("❌ UPDATE PROFILE ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
