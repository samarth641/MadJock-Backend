import mongoose from "mongoose";

const SliderImageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "",
        },
        imageUrl: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        link: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        order: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
        collection: "sliderImages", // Explicitly match the collection name requested by user
    }
);

export default mongoose.model("SliderImage", SliderImageSchema);
