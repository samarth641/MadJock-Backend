import express from "express";
import {
    getUserProfile,
    followUser,
    unfollowUser,
    getUserPosts
} from "../controllers/appUser.controller.js";

const router = express.Router();

// Profile endpoints
router.get("/profile/:id", getUserProfile);
router.get("/posts/:userId", getUserPosts);

// Social endpoints
router.post("/follow/:targetUserId", followUser);
router.post("/unfollow/:targetUserId", unfollowUser);

export default router;
