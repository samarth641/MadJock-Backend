import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// ================= DB  =================
import connectDB from "./config/db.js";

// ================= ROUTES =================

// AUTH
import authRoutes from "./routes/auth.routes.js";

// ADMIN – BUSINESS
import adminBusinessRoutes from "./routes/admin.business.routes.js";

// ADMIN – SERVICES
import adminServiceRoutes from "./routes/admin.service.routes.js";
import manageServiceRoutes from "./routes/service.routes.js";

// ADMIN – USERS (OLD ADMIN USERS / SETTINGS)
import adminUserRoutes from "./routes/admin.user.routes.js";

// NORMAL USERS
import userRoutes from "./routes/user.routes.js";
import manageUsersRoutes from "./routes/manageUsers.routes.js";

// FEATURED ADS (Approved Businesses)
import featuredRoutes from "./routes/featured.routes.js";

// ALTER BUSINESS
import alterRoutes from "./routes/alter.routes.js";

// 🆕 ADMIN – USER APPROVAL (REUSED sales routes)
import adminSalesRoutes from "./routes/admin.sales.routes.js";

// SLIDER IMAGES
import sliderRoutes from "./routes/slider.routes.js";
import communityRoutes from "./routes/community.routes.js";
import appUserRoutes from "./routes/appUser.routes.js";

const app = express();

// ================= MIDDLEWARE =================
import dbMiddleware from "./middleware/db.middleware.js";

app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
  "http://localhost:3000",
  "https://madjock-website-frontend.vercel.app",
  "https://madjock-website-frontend-i7112mh0f-samarth641s-projects.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(dbMiddleware); // 🛡️ Ensure DB is connected for every request

// ================= ROUTE MOUNTS =================

// AUTH
app.use("/api/auth", authRoutes);

// ADMIN – BUSINESS
app.use("/api/admin/business", adminBusinessRoutes);

// ADMIN – SERVICES
app.use("/api/admin/service", adminServiceRoutes);
app.use("/api/admin/service", manageServiceRoutes);

// FEATURED ADVERTISEMENTS
app.use("/api/admin/featured", featuredRoutes);

// 🔴 OLD ADMIN USERS (settings, block/unblock etc.)
app.use("/api/admin/admin-users", adminUserRoutes);

// 🟢 USER APPROVAL FLOW (PENDING / APPROVE / REJECT)
app.use("/api/admin/users", adminSalesRoutes);
/*
  GET    /api/admin/users/pending
  PUT    /api/admin/users/:id/approve
  PUT    /api/admin/users/:id/reject
*/

// NORMAL USERS
app.use("/api/app-users", userRoutes);     // old users
app.use("/api/users", appUserRoutes);      // user profiles and social
app.use("/api/admin/users", manageUsersRoutes);  // admin management

// ALTER BUSINESS
app.use("/api/admin/alter", alterRoutes);

// SLIDER IMAGES
app.use("/api/sliders", sliderRoutes);
app.use("/api/community", communityRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("✅ MJ-SALES Backend Running");
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

// Only start the server if running directly (not imported by Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;
