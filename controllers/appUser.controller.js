import User from "../models/User.js";
import CommunityPost from "../models/CommunityPost.js";
import mongoose from "mongoose";

// ─── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * Find a single user by ID from the unified `users` collection.
 * Handles both String (Firebase UID) and ObjectId formats.
 */
const findUserById = async (id) => {
    if (!id) return null;
    try {
        let user = await User.findOne({ _id: id }).select("-password").lean();
        if (!user && mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findOne({ _id: new mongoose.Types.ObjectId(id) }).select("-password").lean();
        }
        return user;
    } catch (err) {
        console.error("findUserById error:", err.message);
        return null;
    }
};

/**
 * Find multiple users by IDs from the unified `users` collection.
 */
const findUsersByIds = async (ids, currentUserId = null) => {
    if (!ids || !ids.length) return [];

    const formattedIds = ids.map(id => id.toString());
    const objectIds = ids
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));

    try {
        const results = await User.find({
            $or: [
                { _id: { $in: formattedIds } },
                { _id: { $in: objectIds } }
            ]
        }).select("name avatar profileImageUrl _id followers").lean();

        return results.map(u => ({
            ...u,
            avatar: u.avatar || u.profileImageUrl || "",
            isFollowing: currentUserId
                ? (Array.isArray(u.followers) && u.followers.map(f => f.toString()).includes(currentUserId.toString()))
                : false,
            followers: undefined // strip large array from response
        }));
    } catch (err) {
        console.error("findUsersByIds error:", err.message);
        return [];
    }
};

/**
 * Update a user document in the unified `users` collection.
 * Handles both String and ObjectId _id formats.
 */
const updateUser = async (id, update) => {
    const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
    const query = objectId ? { $or: [{ _id: id }, { _id: objectId }] } : { _id: id };
    return User.updateOne(query, update);
};

// ─── CONTROLLERS ───────────────────────────────────────────────────────────────

/* ===============================
   GET USER PROFILE
   =============================== */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.query.currentUserId;

        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isFollowing = currentUserId && currentUserId !== id
            ? Array.isArray(user.followers) && user.followers.map(fid => fid.toString()).includes(currentUserId)
            : false;

        return res.status(200).json({
            success: true,
            data: {
                ...user,
                avatar: user.avatar || user.profileImageUrl || "",
                isFollowing,
                followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
                followingCount: Array.isArray(user.following) ? user.following.length : 0,
            }
        });
    } catch (err) {
        console.error("❌ PROFILE ERROR:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
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

        await Promise.all([
            updateUser(userId, { $addToSet: { following: targetUserId } }),
            updateUser(targetUserId, { $addToSet: { followers: userId } })
        ]);

        return res.status(200).json({ success: true, message: "Started following user" });
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

        await Promise.all([
            updateUser(userId, { $pull: { following: targetUserId } }),
            updateUser(targetUserId, { $pull: { followers: userId } })
        ]);

        return res.status(200).json({ success: true, message: "Unfollowed user successfully" });
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

        const posts = await CommunityPost.find({ userId }).sort({ timestamp: -1 });

        return res.status(200).json({ success: true, count: posts.length, data: posts });
    } catch (error) {
        console.error("❌ GET USER POSTS ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch user posts" });
    }
};

/* ===============================
   GET FOLLOWERS
   =============================== */
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId;

        const user = await findUserById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const followers = await findUsersByIds(user.followers || [], currentUserId);
        return res.status(200).json({ success: true, data: followers });
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
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const following = await findUsersByIds(user.following || [], currentUserId);
        return res.status(200).json({ success: true, data: following });
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

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const AddBusiness = mongoose.models.AddBusiness || (await import("../models/AddBusiness.js")).default;

        const searchIds = [userId, user.phone, user.phoneNumber, user._id?.toString()].filter(Boolean);
        console.log(`🔍 Searching businesses for user ${userId} with IDs:`, searchIds);

        const businesses = await AddBusiness.find({
            $and: [
                {
                    $or: [
                        { "selectedApprovedBusiness.userId": { $in: searchIds } },
                        { "selectedApprovedBusiness.uid": { $in: searchIds } },
                        { "selectedApprovedBusiness.whatsapp": { $in: searchIds } },
                        { "selectedApprovedBusiness.contactNumber": { $in: searchIds } }
                    ]
                },
                {
                    $or: [
                        { status: { $regex: /approved|pending/i } },
                        { "selectedApprovedBusiness.status": { $regex: /approved|pending/i } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });

        console.log(`✅ Found ${businesses.length} businesses`);

        return res.status(200).json({ success: true, count: businesses.length, data: businesses });
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
        const {
            name, bio, location, avatar,
            gender, dob, aadhaarNumber, aadhaarImage,
            pincode, email, country
        } = req.body;

        const user = await findUserById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const update = {};
        if (name) update.name = name;
        if (bio !== undefined) update.bio = bio;
        if (location !== undefined) update.location = location;
        if (avatar) update.avatar = avatar;

        if (gender !== undefined) update.gender = gender;
        if (dob !== undefined) update.dob = dob;
        if (aadhaarNumber !== undefined) update.aadhaarNumber = aadhaarNumber;
        if (aadhaarImage !== undefined) update.aadhaarImage = aadhaarImage;
        if (pincode !== undefined) update.pincode = pincode;
        if (email !== undefined) update.email = email;
        if (country !== undefined) update.country = country;

        await updateUser(userId, { $set: update });

        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("❌ UPDATE PROFILE ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
