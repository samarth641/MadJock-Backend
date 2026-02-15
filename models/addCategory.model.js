import mongoose from "mongoose";

const addCategorySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.Mixed, default: () => new mongoose.Types.ObjectId() }, // 🔥 Support legacy + auto-generate new
    name: { type: String, required: true },
    icon: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("AddCategory", addCategorySchema, "add-category");
