import express from "express";
import {
    getActiveSliders,
    getAllSliders,
    addSlider,
    updateSlider,
    deleteSlider,
} from "../controllers/slider.controller.js";
import { uploadSliderImage, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public route to get active sliders
router.get("/active", getActiveSliders);

// Admin routes
router.get("/all", getAllSliders);
router.post("/add", uploadSliderImage, handleUploadError, addSlider);
router.put("/update/:id", uploadSliderImage, handleUploadError, updateSlider);
router.delete("/delete/:id", deleteSlider);

export default router;
