import express from "express";
import {
  getAllBusinesses,
  addBusiness,
  approveBusiness,
  rejectBusiness,
  assignBusinessToSalesPerson,
  getBusinessesForSalesPerson,
  deleteBusiness,
  getBusinessById,
} from "../controllers/admin.business.controller.js";
import {
  uploadAllBusinessFiles,
  handleUploadError,
} from "../middleware/upload.middleware.js";

const router = express.Router();

// ===============================
// GET ALL BUSINESSES (ADMIN)
// ===============================
router.get("/all", getAllBusinesses);

// ===============================
// GET SINGLE BUSINESS BY ID 
// ===============================
router.get("/get/:businessId", getBusinessById);

// ===============================
// ADD BUSINESS (USER SIDE)
// ===============================
router.post(
  "/add-business",
  uploadAllBusinessFiles,
  handleUploadError,
  addBusiness
);

// ===============================
// 🆕 GET BUSINESSES FOR A SALES PERSON (MOBILE APP)
// ===============================
router.get("/sales/:salesPersonId/businesses", getBusinessesForSalesPerson);

// ===============================
// APPROVE BUSINESS (ADMIN)
// ===============================
router.put("/:businessId/approved", approveBusiness);

// ===============================
// REJECT BUSINESS (ADMIN)
// ===============================
router.put("/:businessId/rejected", rejectBusiness);

// ===============================
// 🆕 ASSIGN BUSINESS TO SALES PERSON (ADMIN)
// ===============================
router.put("/:businessId/assign", assignBusinessToSalesPerson);

// ===============================
// 🆕 DELETE BUSINESS (ADMIN)
// ===============================
router.delete("/:businessId", deleteBusiness);

export default router;
