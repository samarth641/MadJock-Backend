import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      default: "",
    },
    years: {
      type: String, // keep string (ex: "2", "3.5", etc)
      default: "",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: false, // Changed to false to handle documents that might use 'phoneNumber'
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // 🆕 SALES ID (ASSIGNED BY ADMIN AFTER APPROVAL)
    salesId: {
      type: String,
      unique: true,
      sparse: true, // MUST be sparse to allow multiple missing values during signup
      trim: true,
    },

    // 🆕 DATE OF BIRTH
    dob: {
      type: mongoose.Schema.Types.Mixed, // handle both String "YYYY-MM-DD" and Firebase Timestamp objects
      default: "",
    },

    // 🆕 EDUCATION DOCUMENTS
    education: {
      tenth: { type: String, default: "" },
      twelfth: { type: String, default: "" },
      ug: { type: String, default: "" },
      pg: { type: String, default: "" },
    },

    // 🆕 EXPERIENCE LIST
    experiences: {
      type: [experienceSchema],
      default: [],
    },

    // 🔹 ROLE: user | admin | sales
    role: {
      type: String,
      enum: ["user", "admin", "sales"],
      default: "user",
    },

    // 🆕 GENDER
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    // 🆕 REFERRAL CODE
    referralCode: {
      type: String,
      trim: true,
      default: "",
    },

    // 🆕 VERIFICATION STATUS
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // 🔹 APPROVAL STATUS (for sales persons)
    approved: {
      type: Boolean,
      default: false, // new sales person = pending
    },

    // 🆕 SOCIAL FEATURES
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    followers: [{
      type: String,
      ref: "User",
    }],
    following: [{
      type: String,
      ref: "User",
    }],
    createdAt: {
      type: mongoose.Schema.Types.Mixed,
    },
    updatedAt: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { strict: false }
);

// ✅ DEFAULT EXPORT - Pointing to usersInfo to pick up existing users
export default mongoose.model("User", userSchema, "usersInfo");
