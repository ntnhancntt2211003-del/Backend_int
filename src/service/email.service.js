import nodemailer from "nodemailer";

let isTransporterVerified = false;

const getTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
};

const verifyTransporter = async () => {
  if (!isTransporterVerified) {
    const transporter = getTransporter();
    try {
      await transporter.verify();
      console.log("✅ Email transporter verified successfully");
      isTransporterVerified = true;
    } catch (error) {
      console.error("❌ Email transporter verification failed:", error.message);
    }
  }
};

export const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    await verifyTransporter();

    const transporter = getTransporter();
    console.log("📤 Sending reset email to:", email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đặt Lại Mật Khẩu - Marketplace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Đặt Lại Mật Khẩu</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Xin chào,</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào nút dưới đây:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Đặt Lại Mật Khẩu
              </a>
            </div>
            
            <p style="color: #666; font-size: 13px; line-height: 1.6;">Link này sẽ hết hạn sau 15 phút.</p>
            <p style="color: #999; font-size: 12px;">© 2025 Marketplace</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

export const sendPasswordResetSuccessEmail = async (email, username) => {
  try {
    await verifyTransporter();

    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mật Khẩu Đã Được Đặt Lại Thành Công",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">✓ Mật Khẩu Đã Được Đặt Lại</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Xin chào ${username},</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.</p>
            <p style="color: #999; font-size: 12px;">© 2025 Marketplace</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Success email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending success email:", error.message);
    throw error;
  }
};
