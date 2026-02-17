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

    // 1. Check main collection via UserInfo model (most reliable for simple ID lookup)
    let user = await query(UserInfo);
    if (user) return user;

    // 2. Check main collection via User model (richer schema)
    user = await query(User);
    if (user) return user;

    // 3. Check old collection (users)
    return await query(UserOld);
};

/* ===============================
   GET USER PROFILE
   =============================== */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.query.currentUserId; // Optional: to check if following

        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Logic to check if current user is following this profile
        let isFollowing = false;
        if (currentUserId) {
            isFollowing = Array.isArray(user.followers) && user.followers.map(fid => fid.toString()).includes(currentUserId);
        }

        console.log(`DEBUG: Found user ${user._id} for profile request. Followers: ${user.followers?.length}, Following: ${user.following?.length}`);

        res.status(200).json({
            success: true,
            data: {
                ...user,
                isFollowing,
                followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
                followingCount: Array.isArray(user.following) ? user.following.length : 0
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

/* ===============================
   FOLLOW USER
   =============================== */
export const followUser = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const { userId } = req.body;

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

        // Check which collection each user belongs to for update
        const UserOld = mongoose.models.UserOld || mongoose.model("UserOld", User.schema, "users");

        const determineModel = (u) => {
            // If the user's ID is a 24-character hex string, it might be in either but we check ID format
            // However, a safer way is to check the actual document provenance if we had it.
            // For now, we update both or attempt to determine by collection check.
            // SIMPLER: use updateOne on the User model (which is usersInfo) and UserOld (which is users).
            return User;
        };

        // Add targetUser to user's following
        // Using updateOne with $addToSet bypasses document-level validation and casting
        await User.updateOne({ _id: userId }, { $addToSet: { following: targetUserId } });
        await UserOld.updateOne({ _id: userId }, { $addToSet: { following: targetUserId } });

        // Add user to targetUser's followers
        await User.updateOne({ _id: targetUserId }, { $addToSet: { followers: userId } });
        await UserOld.updateOne({ _id: targetUserId }, { $addToSet: { followers: userId } });

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
            return res.status(400).json({ success: false, message: "User ID required" });
        }

        const [user, targetUser] = await Promise.all([
            findUserById(userId),
            findUserById(targetUserId)
        ]);

        if (!user || !targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const UserOld = mongoose.models.UserOld || mongoose.model("UserOld", User.schema, "users");

        // Remove targetUser from user's following
        await User.updateOne({ _id: userId }, { $pull: { following: targetUserId } });
        await UserOld.updateOne({ _id: userId }, { $pull: { following: targetUserId } });

        // Remove user from targetUser's followers
        await User.updateOne({ _id: targetUserId }, { $pull: { followers: userId } });
        await UserOld.updateOne({ _id: targetUserId }, { $pull: { followers: userId } });

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
