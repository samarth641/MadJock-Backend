import mongoose from "mongoose";

// Global cached connection for serverless (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (process.env.MONGO_URI === undefined) {
    console.error("❌ MONGO_URI is missing in environment variables");
    // Don't exit process in serverless, just throw error to be logged
    throw new Error("MONGO_URI is missing");
  }

  // If cached connection exists, use it
  if (cached.conn) {
    // console.log("✅ Using cached MongoDB connection");
    return cached.conn;
  }

  // If no cached promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering for serverless
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      console.log("✅ New MongoDB connection established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", e.message);
    throw e;
  }

  return cached.conn;
};

export default connectDB;