import axios from "axios";

export const sendOtpSms = async (phone, otp) => {
  try {
    // ✅ Ensure India format
    const formattedPhone = phone.startsWith("91")
      ? phone
      : `91${phone}`;

    // ✅ Message format as requested
    const message = `Hi user, ${otp} is your mobile verification code login. Visit our website www.madjock.com -TARK INNOVATIONS`;

    // ✅ Draft4SMS API endpoint with direct parameters
    const apikey = process.env.DRAFT4SMS_API_KEY;
    const senderid = "TARKIN"; // As per previous config or sender ID requirement
    const mobile = formattedPhone;

    const smsUrl = `https://text.draft4sms.com/vb/apikey.php?apikey=${apikey}&senderid=${senderid}&number=${mobile}&message=${encodeURIComponent(message)}`;

    const response = await axios.get(smsUrl);

    console.log("📩 SMS API RESPONSE:", response.data);

    // ❌ Failure handling
    if (
      response.data?.status !== "Success" &&
      response.data?.code !== "011"
    ) {
      throw new Error(
        response.data?.description || "SMS sending failed"
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ SMS ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
};
