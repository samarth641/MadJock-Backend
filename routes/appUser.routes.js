import express from "express";
import {
    getUserProfile,
    followUser,
    unfollowUser,
    getUserPosts,
    getFollowers,
    getFollowing,
    getUserBusinesses,
    updateUserProfile
} from "../controllers/appUser.controller.js";

const router = express.Router();

// Profile endpoints
router.get("/profile/:id", getUserProfile);
router.put("/profile/:userId", updateUserProfile);
router.get("/posts/:userId", getUserPosts);
router.get("/businesses/:userId", getUserBusinesses);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);

// Social endpoints
router.post("/follow/:targetUserId", followUser);
router.post("/unfollow/:targetUserId", unfollowUser);

export default router;
