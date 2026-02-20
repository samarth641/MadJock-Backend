import express from "express";
import { getAllWithdrawals, markCompleted } from "../controllers/withdrawal.controller.js";

const router = express.Router();

router.get("/all", getAllWithdrawals);
router.put("/:id/complete", markCompleted);

export default router;
