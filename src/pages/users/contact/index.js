import { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import "./style.scss";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage("✅ Tin nhắn của bạn đã được gửi thành công!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitMessage(
          "❌ " + (data.message || "Có lỗi xảy ra. Vui lòng thử lại.")
        );
      }

      // Clear message after 5 seconds
      setTimeout(() => setSubmitMessage(""), 5000);
    } catch (error) {
      setSubmitMessage("❌ Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact__page">
      {/* Header Section */}
      <div className="contact__hero">
        <div className="hero__content">
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>HKT Market - Nơi bạn tìm thấy những sản phẩm tốt nhất</p>
        </div>
      </div>

      {/* Main Contact Section */}
      <div className="container__contact">
        <div className="contact__wrapper">
          <div className="contact__content">
            {/* Contact Info */}
            <div className="contact__info">
              <h2>Thông Tin Liên Hệ</h2>

              <div className="info__item">
                <div className="info__icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="info__text">
                  <h3>Địa Chỉ</h3>
                  <p>Trường Đại học Kỹ thuật - Công nghệ Cần Thơ</p>
                  <p>Số 1, Lý Tự Trọng, Phường Xuân Khánh, Quận Ninh Kiều</p>
                  <p>TP. Cần Thơ, Việt Nam</p>
                </div>
              </div>

              <div className="info__item">
                <div className="info__icon">
                  <FaPhone />
                </div>
                <div className="info__text">
                  <h3>Điện Thoại</h3>
                  <p>+84 (0) 123 456 789</p>
                  <p className="small">Hỗ trợ: 8:00 - 20:00 hàng ngày</p>
                </div>
              </div>

              <div className="info__item">
                <div className="info__icon">
                  <FaEnvelope />
                </div>
                <div className="info__text">
                  <h3>Email</h3>
                  <p>support@hktmarket.com</p>
                  <p className="small">Phản hồi trong 24 giờ</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="social__section">
                <h3>Theo Dõi Chúng Tôi</h3>
                <div className="social__links">
                  <a
                    href="#"
                    className="social__link facebook"
                    title="Facebook"
                  >
                    <FaFacebook />
                  </a>
                  <a href="#" className="social__link twitter" title="Twitter">
                    <FaTwitter />
                  </a>
                  <a
                    href="#"
                    className="social__link linkedin"
                    title="LinkedIn"
                  >
                    <FaLinkedin />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact__form__wrapper">
              <h2>Gửi Tin Nhắn</h2>
              <form className="contact__form" onSubmit={handleSubmit}>
                <div className="form__group">
                  <label htmlFor="name">Họ và tên *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên của bạn"
                    className="form__input"
                    required
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email của bạn"
                    className="form__input"
                    required
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="subject">Chủ đề *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Chủ đề tin nhắn"
                    className="form__input"
                    required
                  />
                </div>

                <div className="form__group">
                  <label htmlFor="message">Tin nhắn *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nội dung tin nhắn của bạn"
                    className="form__input form__textarea"
                    rows="6"
                    required
                  ></textarea>
                </div>

                {submitMessage && (
                  <div
                    className={`submit__message ${
                      submitMessage.includes("✅") ? "success" : "error"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="form__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi Tin Nhắn"}
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="contact__map">
            <h2>Vị Trí Của Chúng Tôi</h2>
            <iframe
              title="HKT Market Location"
              width="100%"
              height="450"
              frameBorder="0"
              style={{ border: 0, borderRadius: "12px" }}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.669504652894!2d105.76829832347014!3d10.044842890620834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0884b8b8b8b8b%3A0x1234567890abcdef!2zVHLGsOG7nW5nIMSQaC4gSMO5IFRo4buRYyAtIENAQW5nIE5naOG7hyBD4bqnbiBC6oU/bywgUsOzIFN0LiAp!5e0!3m2!1svi!2s!4v1701864000000"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
