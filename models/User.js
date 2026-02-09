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
    phone: {
      type: String,
      unique: true,
      required: true,
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

    // 🆕 SALES PERSON ID (ASSIGNED BY ADMIN LATER)
    salesPersonId: {
      type: String,
      unique: true,
      default: null,   // ❗ not required during register
      trim: true,
    },

    // 🆕 DATE OF BIRTH
    dob: {
      type: String, // store as "YYYY-MM-DD"
      default: "",
    },

    // 🆕 EDUCATION DOCUMENTS (store file URL / path / base64 later)
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

    // 🔹 APPROVAL STATUS (for sales persons)
    approved: {
      type: Boolean,
      default: false, // new sales person = pending
    },
  },
  { timestamps: true }
);

// ✅ DEFAULT EXPORT
export default mongoose.model("User", userSchema);