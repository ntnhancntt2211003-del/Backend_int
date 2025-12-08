import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [step, setStep] = useState(token ? 2 : 1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/forgot-password",
        { email }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => setStep(2), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/reset-password/${token}`,
        {
          newPassword: password,
          confirmPassword: confirmPassword,
        }
      );

      if (response.data.success) {
        setSuccess("Mật khẩu đã được đặt lại thành công!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="card-header">
          <h2>Đặt Lại Mật Khẩu</h2>
          <p>
            {step === 1
              ? "Nhập email của bạn để nhận link đặt lại mật khẩu"
              : "Nhập mật khẩu mới"}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleForgotPassword} className="form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Đang gửi..." : "Gửi Link Reset"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="form">
            <div className="form-group">
              <label>Mật Khẩu Mới</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Xác Nhận Mật Khẩu</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </button>
          </form>
        )}

        <div className="back-to-login">
          <button onClick={() => navigate("/login")} className="link-btn">
            ← Quay Lại Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
