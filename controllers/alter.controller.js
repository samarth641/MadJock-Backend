import mongoose from "mongoose";
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
    const { name, featured } = req.body;
    let icon = "";

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

    if (req.file) {
      icon = req.file.location;
    }

    const data = await Category.create({
      name,
      icon,
      featured: featured === "true" || featured === true
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 EDIT CATEGORY
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔧 Flexible validation: Handle empty, missing, or literal "undefined" string
    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "A valid ID is required to update a category",
      });
    }

    const { name, featured } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (req.file) {
      updateData.icon = req.file.location;
    }

    if (featured !== undefined) {
      updateData.featured = featured === "true" || featured === true;
    }

    // 🔥 Use the model's collection directly if needed, or rely on Mixed type schema
    const data = await Category.findOneAndUpdate({ _id: id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data });
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
