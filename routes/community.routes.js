import express from "express";
import {
    createPost,
    getAllPosts,
    likePost,
    addComment,
    searchPosts,
    uploadMedia,
    votePoll
} from "../controllers/community.controller.js";
import { uploadCommunityMedia, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/upload", uploadCommunityMedia, handleUploadError, uploadMedia);
router.post("/create", createPost);
router.get("/all", async (req, res, next) => {
    // Wrap to ensure we can modify the response before it hits res.json if needed
    // But better to just modify the controller or rely on Mongoose toJSON
    next();
}, getAllPosts);
router.get("/search", searchPosts);
router.put("/like/:id", likePost);
router.put("/vote/:id", votePoll);
router.post("/comment/:id", addComment);

export default router;
