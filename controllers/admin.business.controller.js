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
 * ADD business (USER SIDE)  ✅ FIXED: GOES TO PENDING
 */
export const addBusiness = async (req, res) => {
  try {
    const { businessName, ownerName, whatsapp } = req.body;

    if (!businessName || !ownerName || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Check duplicate by whatsapp (inside selectedApprovedBusiness)
    const existing = await AddBusiness.findOne({
      "selectedApprovedBusiness.whatsapp": String(whatsapp).trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Business with this WhatsApp already exists",
      });
    }

    const body = req.body;

    // 🔥 WRAPPER STRUCTURE (NEW BUSINESS MUST BE PENDING)
    const doc = {
      fileUrls: body.media?.images?.map((i) => i.uri) || [],
      status: "pending",        // ✅ TOP-LEVEL = PENDING
      allowPayment: true,
      createdAt: new Date(),

      selectedApprovedBusiness: {
        ownerName: body.ownerName || "",
        businessName: body.businessName || "",
        address: body.address || "",
        pincode: body.pincode || "",
        city: body.city || "",
        state: body.state || "",
        whatsapp: body.whatsapp || "",

        instagram: body.instagram || "NO",
        instagramLink: body.instagramLink || "",
        twitter: body.twitter || "NO",
        twitterLink: body.twitterLink || "",
        facebook: body.facebook || "NO",
        facebookLink: body.facebookLink || "",
        website: body.website || "NO",
        websiteLink: body.websiteLink || "",

        products: body.products || "",
        description: body.description || "",

        gstDoc: body.gstDoc || "NO",
        businessDoc: body.businessDoc || "NO",

        media: {
          banner: body.media?.banner || null,
          logo: body.media?.logo || null,
          images: body.media?.images || [],
          gst: body.media?.gst || null,
          document: body.media?.document || null,
        },

        status: "pending",       // ✅ INSIDE ALSO PENDING
        createdAt: new Date(),
      },
    };

    const business = new AddBusiness(doc);
    await business.save();

    res.status(201).json({
      success: true,
      message: "Business added successfully (Pending approval)",
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
      {
        status: "approved", // ✅ top-level
        "selectedApprovedBusiness.status": "approved", // ✅ inside also
      },
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
      {
        status: "rejected", // ✅ top-level
        "selectedApprovedBusiness.status": "rejected", // ✅ inside also
      },
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

    business.assignedSalesPersonId = salesPersonId;
    business.assignedSalesPersonUserId = salesPersonUserId;

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
 */
export const getBusinessesForSalesPerson = async (req, res) => {
  try {
    const { salesPersonId } = req.params;

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
