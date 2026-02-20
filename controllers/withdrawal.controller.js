import Withdrawal from "../models/Withdrawal.js";

/* ===============================
   GET ALL WITHDRAWALS
   =============================== */
export const getAllWithdrawals = async (req, res) => {
    try {
        const list = await Withdrawal.find().sort({ createdAt: -1 });
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ===============================
   MARK AS COMPLETED
   =============================== */
export const markCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        await Withdrawal.findByIdAndUpdate(id, { status: "completed" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
