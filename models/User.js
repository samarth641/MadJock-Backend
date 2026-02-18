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

    // ─── CONTACT ───────────────────────────────────────────────────────────────
    phone: {
      type: String,
      unique: true,
      sparse: true, // allow documents without phone (legacy Firebase users)
    },
    // Legacy field used by Firebase-era documents
    phoneNumber: {
      type: String,
      sparse: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // ─── PROFILE ───────────────────────────────────────────────────────────────
    name: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    // Legacy field used by Firebase-era documents
    profileImageUrl: {
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
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    dob: {
      // handle both String "YYYY-MM-DD" and legacy Firebase Timestamp objects
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    // ─── SOCIAL ────────────────────────────────────────────────────────────────
    followers: [{ type: String }],
    following: [{ type: String }],

    // ─── ADMIN / SALES ─────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "admin", "sales"],
      default: "user",
    },
    salesId: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs without salesId
      trim: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },

    // ─── VERIFICATION ──────────────────────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // ─── MISC ──────────────────────────────────────────────────────────────────
    referralCode: {
      type: String,
      trim: true,
      default: "",
    },
    education: {
      tenth: { type: String, default: "" },
      twelfth: { type: String, default: "" },
      ug: { type: String, default: "" },
      pg: { type: String, default: "" },
    },
    experiences: {
      type: [experienceSchema],
      default: [],
    },

    // ─── TIMESTAMPS (Mixed to handle legacy Firebase Timestamps) ───────────────
    createdAt: {
      type: mongoose.Schema.Types.Mixed,
    },
    updatedAt: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    strict: false, // allow extra fields from legacy documents to pass through
  }
);

// Virtual so that `user.id` returns the string version of `_id`
userSchema.virtual("id").get(function () {
  return this._id?.toString();
});
userSchema.set("toJSON", { virtuals: true });

// ✅ Points to the unified `users` collection
export default mongoose.model("User", userSchema, "users");
