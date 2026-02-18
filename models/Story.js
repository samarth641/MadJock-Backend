import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userAvatar: {
        type: String,
        default: "",
    },
    media: {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' }
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        index: { expires: 0 } // TTL index
    }
}, { timestamps: true });

// Ensure virtuals are included in JSON output
storySchema.set('toJSON', { virtuals: true });
storySchema.set('toObject', { virtuals: true });

const Story = mongoose.model("Story", storySchema);

export default Story;
