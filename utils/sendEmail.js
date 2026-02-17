import nodemailer from "nodemailer";
import dns from "dns";
import util from "util";

const resolve4 = util.promisify(dns.resolve4);

export const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000,
        });

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: subject,
            text: text,
            html: text.includes('<html>') || text.includes('<div') ? text : undefined
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ EMAIL SENT: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ SEND EMAIL ERROR:", error);
        throw error;
    }
};
