import express from "express";
import {
  getAllSalesPersons,        // pending
  getApprovedSalesPersons,   // approved
  approveSalesPerson,
  rejectSalesPerson,
  deleteSalesPerson,
  requestSalesPerson,
} from "../controllers/admin.sales.controller.js";

const router = express.Router();

// ===============================
// GET ALL PENDING USERS
// ===============================
router.get("/pending", getAllSalesPersons);

// ===============================
// GET ALL APPROVED USERS
// ===============================
router.get("/approved", getApprovedSalesPersons);

// ===============================
// (NOT USED)
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

// ===============================
// DELETE USER
// ===============================
router.delete("/:id", deleteSalesPerson);

export default router;
