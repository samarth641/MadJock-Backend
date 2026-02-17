import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: "",
    },
    text: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'poll'],
        default: 'text'
    },
    feeling: {
        type: String,
        default: ""
    },
    media: {
        image: { type: String, default: "" },
        video: { type: String, default: "" },
        gif: { type: String, default: "" }
    },
    poll: {
        type: new mongoose.Schema({
            question: String,
            options: [new mongoose.Schema({
                text: String,
                votes: [String]
            }, { _id: true })],
            totalVotes: { type: Number, default: 0 }
        }, { _id: false }),
        default: null
    },
    taggedUsers: [{
        userId: String,
        userName: String
    }],
    location: {
        type: new mongoose.Schema({
            lat: Number,
            lng: Number,
            name: String
        }, { _id: false }),
        default: null
    },
    comments: [{
        userId: String,
        userName: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    shares: {
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: [{ // Array of userIds who liked the post
        type: String
    }],
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

// Ensure virtuals are included in JSON output
communityPostSchema.set('toJSON', { virtuals: true, flattenMaps: true });
communityPostSchema.set('toObject', { virtuals: true, flattenMaps: true });

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

export default CommunityPost;
