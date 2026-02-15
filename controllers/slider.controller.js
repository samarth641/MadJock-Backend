import SliderImage from "../models/SliderImage.js";

/**
 * GET all active sliders
 */
export const getActiveSliders = async (req, res) => {
    try {
        const sliders = await SliderImage.find({ status: "active" }).sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: sliders.length,
            data: sliders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET all sliders (Admin)
 */
export const getAllSliders = async (req, res) => {
    try {
        const sliders = await SliderImage.find().sort({ order: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: sliders.length,
            data: sliders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * ADD a new slider
 */
export const addSlider = async (req, res) => {
    try {
        const { title, description, link, order } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image for the slider",
            });
        }

        const imageUrl = req.file.location;

        const newSlider = new SliderImage({
            title,
            description,
            link,
            order: order || 0,
            imageUrl,
        });

        await newSlider.save();

        res.status(201).json({
            success: true,
            message: "Slider image added successfully",
            data: newSlider,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * UPDATE slider status/details
 */
export const updateSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // If a new image is uploaded, update the imageUrl
        if (req.file) {
            updateData.imageUrl = req.file.location;
        }

        const updatedSlider = await SliderImage.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedSlider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Slider updated successfully",
            data: updatedSlider,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * DELETE a slider
 */
export const deleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSlider = await SliderImage.findByIdAndDelete(id);

        if (!deletedSlider) {
            return res.status(404).json({
                success: false,
                message: "Slider not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Slider deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
