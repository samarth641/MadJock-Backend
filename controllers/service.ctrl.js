import mongoose from "mongoose";
import Service from "../models/service.model.js";
/* ===============================
   GET ALL SERVICES
   =============================== */
export const getAll = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADD SERVICE
   =============================== */
export const addOne = async (req, res) => {
  try {
    const { name, service_ID } = req.body;
    const service_icon = req.file ? req.file.location : null;

    const service = await Service.create({
      service_name: name,
      service_ID,
      service_icon,
    });

    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   UPDATE SERVICE
   =============================== */
export const updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const { name, service_ID } = req.body;
    const updateData = {
      service_name: name,
      service_ID,
    };

    if (req.file) {
      updateData.service_icon = req.file.location;
    }

    await Service.findByIdAndUpdate(id, updateData);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   DELETE SERVICE
   =============================== */
export const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    await Service.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
