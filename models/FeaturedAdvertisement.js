import mongoose from "mongoose";

const FeaturedAdvertisementSchema = new mongoose.Schema(
  {
    // 🔥 Reference to AddBusiness (same as before)
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddBusiness",
      required: true,
      unique: true, // same business duplicate featured aagama
    },

    // ✅ OLD FIELD – UNCHANGED
    fileUrls: {
      type: [String],
      default: [],
    },

    // 🔧 Status (backend consistency)
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },

    // ✅ This will store the APPROVED BUSINESS SNAPSHOT
    // Now it can store the FULL WRAPPER or just the inner object (both OK)
    selectedApprovedBusiness: {
      type: Object, // keeping Object so old + new structure both work
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: false,

    // 🔥 MUST MATCH EXISTING COLLECTION
    collection: "Featured-Advertisements",
  }
);

export default mongoose.model(
  "FeaturedAdvertisement",
  FeaturedAdvertisementSchema
);
