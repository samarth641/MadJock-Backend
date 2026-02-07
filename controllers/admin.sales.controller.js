import User from "../models/User.js";

// ===============================
// GET ALL PENDING USERS  (approved = false)
// ===============================
export const getAllSalesPersons = async (req, res) => {
  try {
    // Now: return all users who are NOT approved yet
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
// (NOT USED ANYMORE) REQUEST SALES PERSON
// Keeping function to avoid route crash, but not used in flow
// ===============================
export const requestSalesPerson = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "This endpoint is not used. Users are created via Register.",
  });
};

// ===============================
// APPROVE USER (set approved = true)
// ===============================
export const approveSalesPerson = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { approved: true },
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
// REJECT USER (keep approved = false)
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
