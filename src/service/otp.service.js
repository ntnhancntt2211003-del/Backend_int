import nodemailer from "nodemailer";
import OTP from "../models/otp.model.js";

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

// Generate random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@website.com",
      to: email,
      subject: "Mã xác minh OTP - Đăng ký tài khoản",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Xác minh tài khoản</h2>
          <p>Mã OTP của bạn là:</p>
          <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">Mã này sẽ hết hạn sau 10 phút.</p>
          <p style="color: #666; margin-top: 20px;">
            Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Save OTP to database
export const saveOTP = async (email, otp) => {
  try {
    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete existing OTP for this email
    await OTP.deleteOne({ email });

    // Save new OTP
    await OTP.create({ email, otp, expiresAt });
    return true;
  } catch (error) {
    console.error("Error saving OTP:", error);
    throw new Error("Failed to save OTP");
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const record = await OTP.findOne({ email });

    if (!record) {
      return { success: false, message: "OTP not found or expired" };
    }

    if (record.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    if (new Date() > record.expiresAt) {
      await OTP.deleteOne({ email });
      return { success: false, message: "OTP expired" };
    }

    // OTP verified, delete it
    await OTP.deleteOne({ email });
    return { success: true, message: "OTP verified successfully" };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
};

// Cleanup expired OTPs (run periodically)
export const cleanupExpiredOTPs = async () => {
  try {
    await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log("Expired OTPs cleaned up");
  } catch (error) {
    console.error("Error cleaning up OTPs:", error);
  }
};
