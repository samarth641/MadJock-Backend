// ⚠️ OLD MODELS USE PANROM – change panna vendam
import Service from "../models/service.model.js";
import Category from "../models/addCategory.model.js";

/**
 * GET ALL SERVICES
 */
export const getServices = async (req, res) => {
  try {
    const data = await Service.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL CATEGORIES
 */
export const getCategories = async (req, res) => {
  try {
    const data = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// 🔹 ADD CATEGORY
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name required" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const data = await Category.create({ name });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 ADD SERVICE
export const addService = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name required" });
    }

    const exists = await Service.findOne({ name });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Service already exists" });
    }

    const data = await Service.create({ name });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
