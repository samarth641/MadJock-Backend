import express from "express";
import {
  getAllSalesPersons,   // now returns PENDING USERS
  approveSalesPerson,   // approves USER
  rejectSalesPerson,    // rejects USER
  requestSalesPerson,   // not used (kept to avoid crash)
} from "../controllers/admin.sales.controller.js";

const router = express.Router();

// ===============================
// GET ALL PENDING USERS (approved = false)
// ===============================
router.get("/pending", getAllSalesPersons);

// ===============================
// (NOT USED) REQUEST  - keep for safety
// ===============================
router.post("/request", requestSalesPerson);

// ===============================
// APPROVE USER
// ===============================
router.put("/:id/approve", approveSalesPerson);

// ===============================
// REJECT USER
// ===============================
router.put("/:id/reject", rejectSalesPerson);

export default router;