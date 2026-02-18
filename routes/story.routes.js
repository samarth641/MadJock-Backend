import express from "express";
const router = express.Router();
import { createStory, getStories } from "../controllers/story.controller.js";

router.get("/", getStories);
router.post("/", createStory);

export default router;
