import dotenv from "dotenv";
dotenv.config();

import { generateOtp } from "./utils/generateOtp.js";
import { sendEmail } from "./utils/sendEmail.js";
import { getOtpEmailTemplate } from "./utils/emailTemplates.js";

import fs from "fs";

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync("test-output.txt", msg + "\n");
};

const testOtp = async () => {
    fs.writeFileSync("test-output.txt", ""); // Clear file
    log("--- TESTING OTP GENERATION ---");
    const otp = generateOtp();
    log(`Generated OTP: ${otp}`);
    if (otp.length === 6 && !isNaN(otp)) {
        log("✅ OTP is 6 digits.");
    } else {
        log(`❌ OTP is NOT 6 digits: ${otp}`);
    }

    log("\n--- TESTING EMAIL SENDING ---");
    log("Attempting to send email with HTML template...");
    try {
        const emailHtml = getOtpEmailTemplate(otp);
        await sendEmail("test@example.com", "Test HTML OTP - MadJock", emailHtml);
        log("✅ Email sent successfully");
    } catch (error) {
        log("✅ Caught expected error (due to invalid credentials):");
        log(error.message);
    }
};

testOtp();
