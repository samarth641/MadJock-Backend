import mongoose from "mongoose";
import AddBusiness from "../models/AddBusiness.js";
import FeaturedAdvertisement from "../models/FeaturedAdvertisement.js";

/**
 * GET all businesses (ADMIN)
 * OPTIONAL: ?status=pending | approved | rejected
 */
export const getAllBusinesses = async (req, res) => {
  try {
    const { status, category, search, query, city } = req.query;
    const searchTerm = (search || query || "").trim();
    const cityTerm = (city || "").trim();

    // Build robust filter using $and
    const queryObj = { $and: [] };

    // Status filter
    if (status) {
      queryObj.$and.push({ status: { $regex: `^${status.trim()}$`, $options: "i" } });
    }

    // Category filter
    if (category) {
      queryObj.$and.push({
        "selectedApprovedBusiness.businessCategory": {
          $regex: category.trim().replace(/-/g, ' '),
          $options: "i"
        }
      });
    }

    if (searchTerm) {
      queryObj.$and.push({
        $or: [
          // Nested fields
          { "selectedApprovedBusiness.businessName": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.businessCategory": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.city": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.address": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.state": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.businessLocation": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.description": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.businessDescription": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.products": { $regex: searchTerm, $options: "i" } },
          { "selectedApprovedBusiness.productsOffered": { $regex: searchTerm, $options: "i" } },
          // Top-level fields (for legacy/flat structure support)
          { "businessName": { $regex: searchTerm, $options: "i" } },
          { "businessCategory": { $regex: searchTerm, $options: "i" } },
          { "city": { $regex: searchTerm, $options: "i" } },
          { "address": { $regex: searchTerm, $options: "i" } },
          { "state": { $regex: searchTerm, $options: "i" } },
          { "description": { $regex: searchTerm, $options: "i" } },
          { "products": { $regex: searchTerm, $options: "i" } }
        ]
      });
    }

    if (cityTerm) {
      queryObj.$and.push({
        $or: [
          // Nested fields
          { "selectedApprovedBusiness.city": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.address": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.state": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.businessLocation": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.streetAddresses": { $regex: cityTerm, $options: "i" } },
          // Top-level fields (for legacy/flat structure support)
          { "city": { $regex: cityTerm, $options: "i" } },
          { "address": { $regex: cityTerm, $options: "i" } },
          { "state": { $regex: cityTerm, $options: "i" } }
        ]
      });
    }

    // Fallback if no filters
    const finalFilter = queryObj.$and.length > 0 ? queryObj : {};

    const sortOption = status === "approved" ? { updatedAt: -1 } : { createdAt: -1 };

    const businesses = await AddBusiness.find(finalFilter).sort(sortOption);

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
 * ✅ Allows SAME WhatsApp to add MULTIPLE businesses
 */
export const addBusiness = async (req, res) => {
  try {
    const body = { ...req.body };

    // 🔥 IMPORTANT: if frontend sends _id, REMOVE IT
    delete body._id;

    const { businessName, ownerName, whatsapp } = body;

    if (!businessName || !ownerName || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // ❌ DUPLICATE CHECK REMOVED ❌
    // Now same WhatsApp can add multiple businesses

    // 🔥 Generate simple id like old structure (string)
    const generatedId = Date.now().toString();

    // 📁 Extract S3 file URLs from uploaded files
    const uploadedFiles = req.files || {};

    // Get image URLs
    const imageUrls = uploadedFiles.images
      ? uploadedFiles.images.map((file) => file.location)
      : [];

    // Get logo URL
    const logoUrl = uploadedFiles.logo
      ? uploadedFiles.logo[0].location
      : "";

    // Get banner URL
    const bannerUrl = uploadedFiles.banner
      ? uploadedFiles.banner[0].location
      : "";

    // Get selfie URL
    const selfieUrl = uploadedFiles.selfie
      ? uploadedFiles.selfie[0].location
      : "";

    // Get document URLs
    const businessDocUrl = uploadedFiles.businessDoc
      ? uploadedFiles.businessDoc[0].location
      : "";

    const gstDocUrl = uploadedFiles.gstDoc
      ? uploadedFiles.gstDoc[0].location
      : "";

    // 🔥 Build EXACT OLD STRUCTURE (WITHOUT TOUCHING MONGO _id)
    const doc = {
      fileUrls: imageUrls,
      status: "pending", // TOP LEVEL STATUS = pending
      allowPayment: true,

      selectedApprovedBusiness: {
        noOfEmployee: body.noOfEmployee || "",
        businessImages: imageUrls,
        twitterLink: body.twitterLink || "",
        businessLocation: body.address || "",
        generatedid: generatedId, // ✅ OLD STYLE STRING ID HERE
        businessDocument: body.businessDoc === "YES",
        businessDocumentUrl: businessDocUrl, // ✅ S3 URL for business document
        businessLogo: logoUrl, // ✅ S3 URL for logo
        websiteLink: body.websiteLink ? [body.websiteLink] : [],
        streetAddresses: body.streetAddresses?.length
          ? body.streetAddresses
          : [body.address || ""],
        businessBanner: bannerUrl, // ✅ S3 URL for banner
        ownerName: body.ownerName || "",
        state: body.state || "",
        businessDescription: body.description || "",
        city: body.city || "",
        uid: "",
        pinCode: body.pincode || "",
        establishedIn: body.establishedIn || "",
        payment: false,
        paymentId: "",
        status: "pending",
        productsOffered: body.products || "",
        amountPaid: 0,
        twitterAccount: body.twitter === "YES",
        subscription: [],
        instagramProfileLink: body.instagramLink || "",
        startDate: "",
        selfieImage: selfieUrl, // ✅ S3 URL for selfie
        instagramLink: body.instagramLink || "",
        userId: body.whatsapp || "",
        id: "",
        timestamp: {
          _seconds: Math.floor(Date.now() / 1000),
          _nanoseconds: 0,
        },
        contactNumber: body.whatsapp || "",
        instagramProfile: body.instagram === "YES",
        location: {
          latitude: 0,
          longitude: 0,
        },
        facebookProfile: body.facebook === "YES",
        businessCategory: body.businessCategory || "",
        website: body.website === "YES",
        gstCertificate: body.gstDoc === "YES",
        gstCertificateUrl: gstDocUrl, // ✅ S3 URL for GST certificate
        expiryDate: "",
        facebookLink: body.facebookLink || "",
        businessName: body.businessName || "",
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

    const updatedBusiness = await AddBusiness.findByIdAndUpdate(
      businessId,
      {
        status: "approved",
        "selectedApprovedBusiness.status": "approved",
      },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    const alreadyFeatured = await FeaturedAdvertisement.findOne({
      businessId: updatedBusiness._id,
    });

    if (!alreadyFeatured) {
      await FeaturedAdvertisement.create({
        businessId: updatedBusiness._id,
        selectedApprovedBusiness: updatedBusiness.toObject(),
        status: "approved",
        fileUrls: updatedBusiness.fileUrls || [],
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

    const updatedBusiness = await AddBusiness.findByIdAndUpdate(
      businessId,
      {
        status: "rejected",
        "selectedApprovedBusiness.status": "rejected",
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

    business.selectedApprovedBusiness.assignedSalesPersonId = salesPersonId;
    business.selectedApprovedBusiness.assignedSalesPersonUserId =
      salesPersonUserId;

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
      "selectedApprovedBusiness.assignedSalesPersonUserId": salesPersonId,
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

/**
 * 🆕 DELETE BUSINESS (ADMIN)
 */
export const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const deleted = await AddBusiness.findByIdAndDelete(businessId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    return res.json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete business error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete business",
    });
  }
};
/**
 * 🆕 GET SINGLE BUSINESS BY ID
 * Searches across _id, selectedApprovedBusiness.id, and selectedApprovedBusiness.generatedid
 */
export const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;
    console.log(`🔍 Received request for business detail. ID: ${businessId}`);

    if (!businessId) {
      return res.status(400).json({ success: false, message: "Business ID is required" });
    }

    // Robust search: Try multiple possible ID fields
    let business = null;

    // 1. Try finding by MongoDB _id (Standard flow)
    if (mongoose.Types.ObjectId.isValid(businessId)) {
      business = await AddBusiness.findById(businessId);
    }

    // 2. If not found by ObjectId, search in the custom string fields
    if (!business) {
      business = await AddBusiness.findOne({
        $or: [
          { "selectedApprovedBusiness.id": businessId },
          { "selectedApprovedBusiness.generatedid": businessId },
          { "selectedApprovedBusiness.userId": businessId }
        ]
      });
    }

    // 3. Last ditch effort: Try finding by string _id
    if (!business && !mongoose.Types.ObjectId.isValid(businessId)) {
      business = await AddBusiness.findOne({ _id: businessId }).catch(() => null);
    }

    if (!business) {
      console.warn(`⚠️ Business not found for ID: ${businessId}`);
      return res.status(404).json({
        success: false,
        message: "Business not found in database",
      });
    }

    console.log(`✅ Business found: ${business.selectedApprovedBusiness?.businessName || 'Unnamed'}`);
    return res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("❌ Get business by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching business details",
      error: error.message
    });
  }
};
