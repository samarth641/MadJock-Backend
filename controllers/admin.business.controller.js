import mongoose from "mongoose";
import AddBusiness from "../models/AddBusiness.js";
import FeaturedAdvertisement from "../models/FeaturedAdvertisement.js";

/**
 * GET all businesses (ADMIN)
 * OPTIONAL: ?status=pending | approved | rejected
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
 */
export const addBusiness = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      category,
      city,
      phone: phoneFromBody,
      whatsapp,
    } = req.body;

    const phoneRaw = phoneFromBody || whatsapp;
    const phone =
      phoneRaw !== undefined && phoneRaw !== null
        ? String(phoneRaw).trim()
        : "";

    if (!businessName || !ownerName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existing = await AddBusiness.findOne({ phone });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Business with this phone already exists",
      });
    }

    const business = new AddBusiness({
      businessName,
      ownerName,
      phone,
      category,
      city,
      status: "pending",
    });

    await business.save();

    res.status(201).json({
      success: true,
      message: "Business added successfully",
      data: business,
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

    // Insert into FeaturedAdvertisements (if not exists)
    const alreadyFeatured = await FeaturedAdvertisement.findOne({
      businessId: updatedBusiness._id,
    });

    if (!alreadyFeatured) {
      await FeaturedAdvertisement.create({
        businessId: updatedBusiness._id,
        selectedApprovedBusiness: updatedBusiness.toObject(),
        status: "approved",
        fileUrls: [],
      });
    }

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

    // 🔥 FIX: use assignedSalesPersonUserId (ObjectId field)
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
