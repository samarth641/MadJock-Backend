import mongoose from "mongoose";

// --------------------
// Media Sub Schema
// --------------------
const MediaSchema = new mongoose.Schema(
  {
    banner: { type: Object, default: null },
    logo: { type: Object, default: null },
    images: { type: [Object], default: [] },
    gst: { type: Object, default: null },
    document: { type: Object, default: null },

    // 🔥 ADDED (old structure support)
    selfie: { type: Object, default: null },
  },
  { _id: false }
);

// --------------------
// Selected Approved Business Sub Schema
// (THIS IS YOUR OLD FLAT STRUCTURE MOVED INSIDE)
// --------------------
const SelectedApprovedBusinessSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON uses array of addresses)
    streetAddresses: {
      type: [String],
      default: [],
    },

    // 🔥 ADDED (old JSON uses businessLocation)
    businessLocation: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON uses pinCode)
    pinCode: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    // Old JSON uses contactNumber instead of whatsapp
    contactNumber: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON fields)
    uid: {
      type: String,
      default: "",
    },

    userId: {
      type: String,
      default: "",
    },

    id: {
      type: String,
      default: "",
    },

    generatedid: {
      type: String,
      default: "",
      index: true,
    },

    // Social
    instagram: {
      type: String,
      default: "",
    },
    instagramLink: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON)
    instagramProfile: {
      type: Boolean,
      default: false,
    },

    instagramProfileLink: {
      type: String,
      default: "",
    },

    twitter: {
      type: String,
      default: "",
    },
    twitterLink: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON)
    twitterAccount: {
      type: Boolean,
      default: false,
    },

    facebook: {
      type: String,
      default: "",
    },
    facebookLink: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON)
    facebookProfile: {
      type: Boolean,
      default: false,
    },

    website: {
      type: String,
      default: "",
    },

    // Old JSON uses array for websiteLink
    websiteLink: {
      type: [String],
      default: [],
    },

    // 🔥 ADDED (old JSON)
    businessCategory: {
      type: String,
      default: "",
    },

    // From UI
    products: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON uses productsOffered)
    productsOffered: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON uses businessDescription)
    businessDescription: {
      type: String,
      default: "",
    },

    gstDoc: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },

    // 🔥 ADDED (old JSON uses gstCertificate boolean)
    gstCertificate: {
      type: Boolean,
      default: false,
    },

    businessDoc: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },

    // 🔥 ADDED (old JSON uses businessDocument boolean)
    businessDocument: {
      type: Boolean,
      default: false,
    },

    media: {
      type: MediaSchema,
      default: () => ({}),
    },

    // 🔥 ADDED (old JSON image fields)
    businessBanner: {
      type: String,
      default: "",
    },

    businessLogo: {
      type: String,
      default: "",
    },

    businessImages: {
      type: [String],
      default: [],
    },

    selfieImage: {
      type: String,
      default: "",
    },

    // 🔥 ADDED (old JSON fields)
    noOfEmployee: {
      type: String,
      default: "",
    },

    establishedIn: {
      type: Number,
      default: null,
    },

    payment: {
      type: Boolean,
      default: false,
    },

    paymentId: {
      type: String,
      default: "",
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    subscription: {
      type: [Object],
      default: [],
    },

    startDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },

    timestamp: {
      type: Object,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ASSIGNED SALES PERSON
    assignedSalesPersonId: {
      type: String, // e.g. SP001
      default: null,
      index: true,
    },

    assignedSalesPersonUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// --------------------
// MAIN WRAPPER SCHEMA
// --------------------
const AddBusinessSchema = new mongoose.Schema(
  {
    // Top-level wrapper fields (LIKE YOUR FIRST JSON)
    fileUrls: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      default: "Approved", // top-level status
    },

    allowPayment: {
      type: Boolean,
      default: true,
    },

    // All business details inside this
    selectedApprovedBusiness: {
      type: SelectedApprovedBusinessSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: false,
    collection: "add-business",
  }
);

export default mongoose.model("AddBusiness", AddBusinessSchema);
