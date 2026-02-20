import express from "express";
import { getAll, addOne, updateOne, deleteOne } from "../controllers/service.ctrl.js";
import { uploadServiceIcon, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

// 🔥 matches frontend URLs
router.get("/manage/all", getAll);
router.post("/manage/add", uploadServiceIcon, handleUploadError, addOne);
router.put("/manage/:id", uploadServiceIcon, handleUploadError, updateOne);
router.delete("/manage/:id", deleteOne);

export default router;
