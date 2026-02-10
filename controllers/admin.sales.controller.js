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
// HELPER: GENERATE NEXT SALES ID (SP001, SP002, ...)
// ===============================
const generateNextSalesId = async () => {
  const lastUser = await User.findOne({ salesId: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .select("salesId");

  if (!lastUser || !lastUser.salesId) {
    return "SP001";
  }

  const lastNumber = parseInt(lastUser.salesId.replace("SP", ""), 10);
  const nextNumber = lastNumber + 1;

  return "SP" + String(nextNumber).padStart(3, "0");
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

    // If already approved, just return
    if (user.approved === true && user.salesId) {
      return res.status(200).json({
        success: true,
        message: "User already approved",
        data: user,
      });
    }

    // Generate new Sales ID
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
// REJECT USER (set approved = false, keep salesId untouched or null)
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
