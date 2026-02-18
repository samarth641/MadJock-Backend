import dotenv from "dotenv";
dotenv.config();
import { sendOtpSms } from "./utils/sendOtpSms.js";

async function testSms() {
    const testNumber = "9307202431";
    const testOtp = "123456";

    console.log(`🚀 Sending test OTP ${testOtp} to ${testNumber}...`);

    try {
        const result = await sendOtpSms(testNumber, testOtp);
        console.log("✅ SMS SENT SUCCESSFULLY!");
        console.log("Response:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ SMS SENDING FAILED!");
        console.error(error.message);
    }
}

testSms();
