import { sendContactEmail } from "../service/email.service.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ tất cả các trường",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
      });
    }

    // Send email
    await sendContactEmail(name, email, subject, message);

    return res.status(200).json({
      success: true,
      message:
        "Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.",
    });
  } catch (error) {
    console.error("Error in sendContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};
