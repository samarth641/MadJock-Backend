import connectDB from "../config/db.js";

const dbMiddleware = async (req, res, next) => {
    try {
        // Ensure database connection is established before proceeding
        await connectDB();
        next();
    } catch (error) {
        console.error("❌ Database connection error in middleware:", error.message);
        res.status(500).json({
            success: false,
            message: "External Error: Database connection failed",
        });
    }
};

export default dbMiddleware;
