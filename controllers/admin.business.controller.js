import mongoose from "mongoose";
import AddBusiness from "../models/AddBusiness.js";
import FeaturedAdvertisement from "../models/FeaturedAdvertisement.js";

/**
 * GET all businesses (ADMIN)
 * OPTIONAL: ?status=pending | approved | rejected
 * NOTE: This still reads from AddBusiness (if you still need admin listing)
 */
export const getAllBusinesses = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const sortOption =
      status === "approved" ? { updatedAt: -1 } : { createdAt: -1 };

    const businesses = await AddBusiness.find(filter).sort(sortOption);

    res.json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADD business (USER SIDE)
 * 🔥 NOW: Save ONLY to FeaturedAdvertisements
 * ❌ No save to AddBusiness
 */
export const addBusiness = async (req, res) => {
  try {
    const data = req.body; // 🔥 Frontend anuppura exact JSON (no modify)

    // ✅ ONLY Featured Advertisement la save pannum
    const featured = await FeaturedAdvertisement.create(data);

    res.status(201).json({
      success: true,
      message: "Business added to Featured Advertisements successfully",
      data: featured,
    });
  } catch (error) {
    console.error("❌ Add business error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * APPROVE business (ADMIN)
 * NOTE: Ippo FeaturedAdvertisement already add pannirukkom in addBusiness,
 * so inga FeaturedAdvertisement la insert pannura logic REMOVE panniten.
 * Idhu AddBusiness status update ku mattum irukkum (if you still use AddBusiness).
 */
export const approveBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid business ID",
      });
    }

    const updatedBusiness = await AddBusiness.findByIdAndUpdate(
      businessId,
      { status: "approved" },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    // ❌ REMOVED: FeaturedAdvertisement.create(...) from here
    // Because now we save directly to FeaturedAdvertisements in addBusiness

    res.json({
      success: true,
      message: "Business approved successfully",
      data: updatedBusiness,
    });
  } catch (error) {
    console.error("❌ Approve error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * REJECT business (ADMIN)
 */
export const rejectBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid business ID",
      });
    }

    const updatedBusiness = await AddBusiness.findByIdAndUpdate(
      businessId,
      { status: "rejected" },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      message: "Business rejected successfully",
      data: updatedBusiness,
    });
  } catch (error) {
    console.error("❌ Reject error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 🆕 ASSIGN BUSINESS TO SALES PERSON (ADMIN)
 * Body: { salesPersonId, salesPersonUserId }
 * NOTE: This still works with AddBusiness (if you are using that flow)
 */
export const assignBusinessToSalesPerson = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { salesPersonId, salesPersonUserId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid business ID",
      });
    }

    if (!salesPersonId || !salesPersonUserId) {
      return res.status(400).json({
        success: false,
        message: "salesPersonId and salesPersonUserId are required",
      });
    }

    const business = await AddBusiness.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    business.assignedSalesPersonId = salesPersonId; // e.g. "SP001"
    business.assignedSalesPersonUserId = salesPersonUserId; // USER._id

    await business.save();

    return res.status(200).json({
      success: true,
      message: "Business assigned to sales person successfully",
      data: business,
    });
  } catch (error) {
    console.error("❌ Assign business error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign business",
    });
  }
};

/**
 * 🆕 GET BUSINESSES FOR A SALES PERSON (MOBILE APP)
 * Params: :salesPersonId  (THIS IS USER._id)
 * NOTE: Still reads from AddBusiness (if you are using that flow)
 */
export const getBusinessesForSalesPerson = async (req, res) => {
  try {
    const { salesPersonId } = req.params; // USER._id

    if (!salesPersonId) {
      return res.status(400).json({
        success: false,
        message: "salesPersonId is required",
      });
    }

    const businesses = await AddBusiness.find({
      assignedSalesPersonUserId: salesPersonId,
      status: "approved",
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (error) {
    console.error("❌ Get businesses for sales person error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch businesses",
    });
  }
};
