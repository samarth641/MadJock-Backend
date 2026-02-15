import express from "express";
import {
  getServices,
  getCategories,
  addService,
  addCategory,
  editCategory,
} from "../controllers/alter.controller.js";
import { uploadCategoryIcon, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

// ================= GET (ALREADY WORKING) =================
router.get("/services", getServices);
router.get("/categories", getCategories);

// ================= POST (NEW – SAFE ADD) =================
router.post("/services", addService);
router.post("/categories", uploadCategoryIcon, handleUploadError, addCategory);

// ================= PUT (EDIT) =================
router.put("/categories/:id", uploadCategoryIcon, handleUploadError, editCategory);

export default router;
