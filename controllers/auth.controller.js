import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpSms } from "../utils/sendOtpSms.js";

/* ===============================
   SEND OTP  (ONLY FOR REGISTERED USERS)
   =============================== */
/* ===============================
   SEND OTP (FOR ANYONE)
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

    const otp = generateOtp();

    // Clear old OTPs
    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    await sendOtpSms(phone, otp);

    console.log("✅ PHONE OTP GENERATED:", otp);

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
   VERIFY OTP
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

    // OTP valid → delete it
    await Otp.deleteMany({ phone });

    // Find user (to check if they need login or signup)
    const user = await User.findOne({ phone });

    // Generate token if user exists
    let token = null;
    if (user) {
      token = jwt.sign(
        { id: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      exists: !!user,
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
   CHECK USER EXISTS
   =============================== */
export const checkUserExists = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone required",
      });
    }

    const user = await User.findOne({ phone });

    return res.status(200).json({
      success: true,
      exists: !!user,
      user: user || null
    });
  } catch (error) {
    console.error("❌ CHECK USER ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to check user",
    });
  }
};

/* ===============================
   SEND EMAIL OTP
   =============================== */
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const otp = generateOtp();

    // Clear old OTPs
    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // 📩 Placeholder for email utility
    console.log("✅ EMAIL OTP GENERATED:", otp, "FOR:", email);
    // In a real scenario: await sendEmail(email, `Your OTP is ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Email OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ SEND EMAIL OTP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send Email OTP",
    });
  }
};

/* ===============================
   VERIFY EMAIL OTP
   =============================== */
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email & OTP required",
      });
    }

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    await Otp.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("❌ VERIFY EMAIL OTP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

/* ===============================
   NEW SIGNUP (FULL REGISTER)
   =============================== */
export const registerFullUser = async (req, res) => {
  try {
    const { phone, phoneNumber, name, email, dob, gender, referralCode } = req.body;
    const finalPhone = phone || phoneNumber;

    if (!finalPhone || !name || !email || !dob || !gender) {
      return res.status(400).json({
        success: false,
        message: "Required fields: phone, name, email, dob, gender",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ phone: finalPhone });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already registered. Please login.",
      });
    }

    user = new User({
      phone: finalPhone,
      name,
      email,
      dob,
      gender,
      referralCode: referralCode || "",
      phoneVerified: true,  // Verified in Step 2
      emailVerified: true,  // Verified in Step 3
      approved: false,      // Still needs admin approval for Sales role
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

/* ===============================
   CHECK APPROVAL STATUS
   =============================== */
export const checkApproval = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.approved === false) {
      return res.status(200).json({
        success: false,
        approved: false,
        message: "Still waiting for approval",
      });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      approved: true,
      message: "User approved",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ CHECK APPROVAL ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to check approval",
    });
  }
};
