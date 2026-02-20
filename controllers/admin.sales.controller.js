import User from "../models/User.js";

// ===============================
// GET ALL PENDING USERS (approved = false)
// ===============================
export const getAllSalesPersons = async (req, res) => {
  try {
    const pendingUsers = await User.find({ approved: false }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: pendingUsers,
    });
  } catch (error) {
    console.error("❌ Get pending users error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending users",
    });
  }
};

// ===============================
// GET ALL APPROVED SALES PERSONS (approved = true)
// ===============================
export const getApprovedSalesPersons = async (req, res) => {
  try {
    const approvedUsers = await User.find({ approved: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: approvedUsers,
    });
  } catch (error) {
    console.error("❌ Get approved users error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch approved users",
    });
  }
};

// ===============================
// (NOT USED) REQUEST SALES PERSON
// ===============================
export const requestSalesPerson = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "This endpoint is not used. Users are created via Register.",
  });
};

// ===============================
// HELPER: GENERATE NEXT SALES ID (MJ-YYYY-001, MJ-YYYY-002, ...)
// ===============================
const generateNextSalesId = async () => {
  const year = new Date().getFullYear(); // e.g., 2026
  const prefix = `MJ-${year}-`;

  // Find the last user for this year with salesId like MJ-YYYY-XXX
  const lastUser = await User.findOne({
    salesId: { $regex: `^${prefix}` },
  })
    .sort({ createdAt: -1 })
    .select("salesId");

  if (!lastUser || !lastUser.salesId) {
    return `${prefix}001`;
  }

  // Example: MJ-2026-007 -> take 007
  const parts = lastUser.salesId.split("-");
  const lastNumber = parseInt(parts[2], 10);
  const nextNumber = lastNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

// ===============================
// APPROVE USER (set approved = true + generate salesId)
// ===============================
export const approveSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If already approved and has salesId, just return
    if (user.approved === true && user.salesId) {
      return res.status(200).json({
        success: true,
        message: "User already approved",
        data: user,
      });
    }

    // Generate new Sales ID in MJ-YYYY-XXX format
    const newSalesId = await generateNextSalesId();

    user.approved = true;
    user.salesId = newSalesId;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Approve user error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to approve user",
    });
  }
};

// ===============================
// REJECT USER (set approved = false, keep salesId untouched)
// ===============================
export const rejectSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { approved: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User rejected successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Reject user error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to reject user",
    });
  }
};

// ===============================
// DELETE SALES PERSON
// ===============================
export const deleteSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete user error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
