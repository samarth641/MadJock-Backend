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
        // Fetch all stories that haven't expired
        // MongoDB TTL index handles deletion, so we just fetch all
        const stories = await Story.find().sort({ createdAt: -1 });

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
