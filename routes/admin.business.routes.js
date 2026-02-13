import express from "express";
import {
  getAllBusinesses,
  addBusiness,
  approveBusiness,
  rejectBusiness,
  assignBusinessToSalesPerson,
  getBusinessesForSalesPerson,
  deleteBusiness, // ✅ ADD THIS
} from "../controllers/admin.business.controller.js";

const router = express.Router();

// ===============================
// ADD BUSINESS (USER SIDE)
// ===============================
router.post("/add-business", addBusiness);

// ===============================
// GET ALL BUSINESSES (ADMIN)
// ?status=pending | approved | rejected
// ===============================
router.get("/all", getAllBusinesses);

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
// Body: { salesPersonId, salesPersonUserId }
// ===============================
router.put("/:businessId/assign", assignBusinessToSalesPerson);

// ===============================
// 🆕 GET BUSINESSES FOR A SALES PERSON (MOBILE APP)
// ===============================
router.get("/sales/:salesPersonId/businesses", getBusinessesForSalesPerson);

// ===============================
// 🆕 DELETE BUSINESS (ADMIN)  ✅ ADD THIS
// ===============================
router.delete("/:businessId", deleteBusiness);

// ===============================
// EXPORT
// ===============================
export default router;
