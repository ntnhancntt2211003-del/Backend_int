// src/components/LoginModal.jsx
import { useState } from "react";
import { FiX } from "react-icons/fi";
import "./LoginModal.scss";

const LoginModal = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1); // 1: nhập sđt, 2: nhập OTP

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Đăng nhập/Đăng ký</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {step === 1 ? (
            <>
              {/* Social Login */}
              <button className="social-btn google">
                <img src="/google-icon.svg" alt="Google" />
                Tiếp tục với Google
              </button>
              <button className="social-btn facebook">
                <img src="/facebook-icon.svg" alt="Facebook" />
                Tiếp tục với Facebook
              </button>
              <button className="social-btn apple">
                <img src="/apple-icon.svg" alt="Apple" />
                Tiếp tục với Apple
              </button>

              <div className="divider">
                <span>Hoặc</span>
              </div>

              {/* Phone Input */}
              <div className="phone-input">
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                className="continue-btn"
                disabled={!phone.match(/^\d{10}$/)}
                onClick={() => setStep(2)}
              >
                Tiếp tục
              </button>

              <p className="terms">
                Bằng việc tiếp tục, bạn đã chấp nhận{" "}
                <a href="#">điều khoản sử dụng</a>
              </p>
            </>
          ) : (
            <>
              <h3>Nhập mã OTP</h3>
              <p className="otp-info">
                Mã đã được gửi đến <strong>{phone}</strong>
              </p>
              <div className="otp-inputs">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="otp-box"
                  />
                ))}
              </div>
              <button className="continue-btn">Xác nhận</button>
              <p className="resend">
                Gửi lại mã sau <span>59s</span>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step === 1 ? (
            <>
              Bạn chưa có tài khoản? <a href="#">Đăng ký</a>
            </>
          ) : (
            <button className="back-btn" onClick={() => setStep(1)}>
              Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
