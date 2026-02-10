import mongoose from "mongoose";

const AddBusinessSchema = new mongoose.Schema(
  {
    ownerName: String,
    businessName: String,
    address: String,
    pincode: String,
    city: String,
    state: String,
    whatsapp: String,

    instagram: String,
    instagramLink: String,
    twitter: String,
    twitterLink: String,
    facebook: String,
    facebookLink: String,
    website: String,
    websiteLink: String,

    // 🆕 From UI
    products: String,
    description: String,

    gstDoc: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },

    businessDoc: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },

    media: {
      banner: Object,
      logo: Object,
      images: [Object],
      gst: Object,
      document: Object,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🆕 ASSIGNED SALES PERSON
    assignedSalesPersonId: {
      type: String, // MJ2026001
      default: null,
      index: true,
    },

    // 🆕 OPTIONAL: store user _id also
    assignedSalesPersonUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "add-business",
  }
);

export default mongoose.model("AddBusiness", AddBusinessSchema);
