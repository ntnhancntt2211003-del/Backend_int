import { useState } from "react";
import axios from "axios";
import "./LoginModal.scss";

const RegisterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: account details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(0);

  if (!isOpen) return null;

  // Send OTP to email
  const handleSendOTP = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/send-otp",
        { email }
      );

      if (response.data.success) {
        setMessage("Mã OTP đã được gửi đến email của bạn");
        setOtpSentTime(Date.now());
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("OTP phải là 6 chữ số");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/verify-otp",
        { email, otp }
      );

      if (response.data.success) {
        setMessage("OTP đã xác minh thành công");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  // Create account
  const handleCreateAccount = async () => {
    if (!username || !password || !phone) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:8080/api/create-user",
        {
          username,
          email,
          password,
          numberPhone: phone,
        }
      );

      if (response.data.message === "User created successfully") {
        setMessage("Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP (available after 60 seconds)
  const canResendOTP = Date.now() - otpSentTime > 60000;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đăng ký tài khoản</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {step === 1 && (
            <>
              <h3>Nhập email của bạn</h3>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                className="continue-btn"
                onClick={handleSendOTP}
                disabled={loading || !email}
              >
                {loading ? "Đang gửi..." : "Gửi OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>Xác minh email</h3>
              <p className="otp-info">
                Mã OTP đã được gửi đến <strong>{email}</strong>
              </p>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nhập mã OTP (6 chữ số)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength="6"
                  disabled={loading}
                />
              </div>
              <button
                className="continue-btn"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
              <p className="resend-text">
                {canResendOTP ? (
                  <button
                    className="resend-btn"
                    onClick={() => {
                      setOtp("");
                      handleSendOTP();
                    }}
                  >
                    Gửi lại OTP
                  </button>
                ) : (
                  `Gửi lại OTP sau ${Math.ceil((60000 - (Date.now() - otpSentTime)) / 1000)}s`
                )}
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <h3>Tạo tài khoản</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Tên người dùng"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                className="continue-btn"
                onClick={handleCreateAccount}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
            </>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button
              className="back-btn"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
