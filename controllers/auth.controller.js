import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpSms } from "../utils/sendOtpSms.js";

/* ===============================
   SEND OTP  (ONLY FOR REGISTERED USERS)
   =============================== */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please register first.",
      });
    }

    const otp = generateOtp();

    // Clear old OTPs
    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await sendOtpSms(phone, otp);

    console.log("✅ OTP GENERATED:", otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ SEND OTP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/* ===============================
   VERIFY OTP (WITH APPROVAL FLOW)
   =============================== */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone & OTP required",
      });
    }

    const record = await Otp.findOne({ phone, otp });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered. Please register first.",
      });
    }

    // 🔒 If NOT approved → DO NOT DELETE OTP
    if (user.approved === false) {
      return res.status(403).json({
        success: false,
        message: "Waiting for admin approval",
      });
    }

    // ✅ Now approved → DELETE OTP
    await Otp.deleteMany({ phone });

    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ VERIFY OTP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

/* ===============================
   REGISTER USER
   =============================== */
export const registerUser = async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        name,
        email,
        approved: false,
      });
    } else {
      user.name = name;
      user.email = email;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Registration completed. Waiting for admin approval.",
      user,
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};