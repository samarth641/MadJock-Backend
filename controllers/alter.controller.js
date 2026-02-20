import mongoose from "mongoose";
import Service from "../models/service.model.js";
import Category from "../models/addCategory.model.js";

/**
 * GET ALL SERVICES
 */
export const getServices = async (req, res) => {
  try {
    const data = await Service.find().sort({ service_name: 1 });

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
    // 🔧 Super-Robust: We'll use the native collection to avoid Mongoose casting issues
    const collection = mongoose.connection.db.collection('add-category');

    // Search for both string and ObjectIdversions
    const searchConditions = [{ _id: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    console.log("🔍 Debug: Searching for Category ID:", id, "Conditions:", JSON.stringify(searchConditions));

    const rawData = await collection.findOne({ $or: searchConditions });

    if (!rawData) {
      console.log("❌ Category not found in native collection!");
      // Log first 3 categories for context
      const context = await collection.find({}).limit(3).toArray();
      console.log("📋 DB Samples:", JSON.stringify(context.map(c => ({ id: c._id, type: typeof c._id }))));

      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Since we found it via native collection, we'll update it via native collection too
    const finalUpdate = { $set: {} };
    if (name) finalUpdate.$set.name = name;
    if (req.file) {
      finalUpdate.$set.icon = req.file.location;
    }
    if (featured !== undefined) {
      finalUpdate.$set.featured = featured === "true" || featured === true;
    }

    await collection.updateOne({ _id: rawData._id }, finalUpdate);

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: { ...rawData, ...finalUpdate.$set }
    });
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

    const exists = await Service.findOne({ service_name: name });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Service already exists" });
    }

    const data = await Service.create({ service_name: name });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
