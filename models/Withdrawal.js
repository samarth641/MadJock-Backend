import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        username: {
            type: String,
            default: "Unknown"
        },
        upiId: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "completed", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Withdrawal", withdrawalSchema);
