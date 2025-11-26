import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./PersonalInfo.scss";

const PersonalInfo = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(user?.avatar || "/avatar/default.webp");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Info Tab States
  const [infoForm, setInfoForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    numberPhone: user?.numberPhone || "",
    address: user?.address || "",
  });
  const [editingInfo, setEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  // Password Tab States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  if (!user) {
    return (
      <div className="personal-info-container">
        <div className="not-logged-in">
          <h2>Vui lòng đăng nhập để truy cập trang này</h2>
        </div>
      </div>
    );
  }

  // ===== AVATAR HANDLERS =====
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một file hình ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Check if user.id exists
      if (!user?.id) {
        throw new Error("User ID not found. Please re-login.");
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const avatarUrl = event.target.result;

          console.log("DEBUG: Updating avatar for user:", user.id);
          console.log("DEBUG: Token:", token ? "exists" : "missing");
          console.log(
            "DEBUG: Endpoint:",
            `http://localhost:8080/api/user/${user.id}/avatar`
          );

          try {
            const response = await fetch(
              `http://localhost:8080/api/user/${user.id}/avatar`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  avatarUrl: avatarUrl,
                }),
              }
            );

            console.log("DEBUG: Response status:", response.status);
            console.log("DEBUG: Response ok:", response.ok);

            let data;
            try {
              data = await response.json();
              console.log("DEBUG: Response data:", data);
            } catch (parseErr) {
              console.error("DEBUG: Failed to parse response:", parseErr);
              data = null;
            }

            if (response.ok) {
              setAvatar(avatarUrl);
              setSuccess("Cập nhật ảnh đại diện thành công!");
            } else {
              setError(data?.message || `Server error: ${response.status}`);
            }
          } catch (fetchErr) {
            console.error("DEBUG: Fetch failed:", fetchErr);
            console.error("DEBUG: Fetch error message:", fetchErr.message);
            console.error("DEBUG: Fetch error stack:", fetchErr.stack);
            setError("Lỗi kết nối: " + fetchErr.message);
          }
        } catch (err) {
          console.error("DEBUG: Error in upload:", err);
          setError("Lỗi: " + err.message);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("DEBUG: Error in handleAvatarChange:", err);
      setError("Lỗi upload: " + err.message);
      setUploading(false);
    }
  };

  // ===== INFO HANDLERS =====
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/user/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: infoForm.username,
            numberPhone: infoForm.numberPhone,
            address: infoForm.address,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Cập nhật thông tin thành công!");
        setEditingInfo(false);
      } else {
        setError(data.message || "Lỗi cập nhật thông tin");
      }
    } catch (err) {
      setError("Lỗi: " + err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleCancelInfo = () => {
    setInfoForm({
      username: user?.username || "",
      email: user?.email || "",
      numberPhone: user?.numberPhone || "",
    });
    setEditingInfo(false);
    setError("");
  };

  // ===== PASSWORD HANDLERS =====
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePassword = async () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setSavingPassword(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/user/${user.id}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Lỗi đổi mật khẩu");
      }
    } catch (err) {
      setError("Lỗi: " + err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="personal-info-container">
      <div className="personal-info-wrapper">
        <div className="info-header">
          <h1>Quản lý tài khoản</h1>
          <p>Cập nhật thông tin cá nhân, mật khẩu và hình đại diện</p>
        </div>

        <div className="info-content">
          {/* LEFT: Avatar Section */}
          <div className="info-left">
            <div className="avatar-card">
              <h3>Ảnh đại diện</h3>
              <div className="avatar-section">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="avatar-display"
                  onError={(e) => {
                    e.target.src = "/avatar/default.webp";
                  }}
                />
                <label htmlFor="avatar-input" className="avatar-upload-btn">
                  <i className="fas fa-camera"></i>
                  <span>Thay đổi ảnh</span>
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                <p className="avatar-hint">JPG, GIF hoặc PNG. Tối đa 5MB</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Info and Password Tabs */}
          <div className="info-right">
            {/* Alerts */}
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Tabs */}
            <div className="info-tabs">
              <button
                className={`tab ${activeTab === "info" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("info");
                  setError("");
                  setSuccess("");
                }}
              >
                Thông tin cá nhân
              </button>
              <button
                className={`tab ${activeTab === "password" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("password");
                  setError("");
                  setSuccess("");
                }}
              >
                Đổi mật khẩu
              </button>
            </div>

            {/* INFO TAB */}
            {activeTab === "info" && (
              <div className="tab-content info-tab">
                {editingInfo ? (
                  <form
                    className="info-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveInfo();
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="username">Tên người dùng</label>
                      <input
                        id="username"
                        type="text"
                        name="username"
                        value={infoForm.username}
                        onChange={handleInfoChange}
                        placeholder="Nhập tên người dùng"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={infoForm.email}
                        onChange={handleInfoChange}
                        disabled
                        className="disabled"
                        title="Email không thể thay đổi"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="numberPhone">Số điện thoại</label>
                      <input
                        id="numberPhone"
                        type="tel"
                        name="numberPhone"
                        value={infoForm.numberPhone}
                        onChange={handleInfoChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Địa chỉ</label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        value={infoForm.address}
                        onChange={handleInfoChange}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    {user.role === "admin" && (
                      <div className="form-group">
                        <label>Vai trò</label>
                        <input
                          type="text"
                          value="Admin"
                          disabled
                          className="disabled role-admin"
                        />
                      </div>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancelInfo}
                        disabled={savingInfo}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn-save"
                        disabled={savingInfo}
                      >
                        {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="info-display">
                    <div className="display-header">
                      <h3>Thông tin cá nhân</h3>
                      <button
                        className="btn-edit"
                        onClick={() => setEditingInfo(true)}
                      >
                        Chỉnh sửa
                      </button>
                    </div>

                    <div className="info-item">
                      <span className="label">Tên người dùng</span>
                      <span className="value">{infoForm.username}</span>
                    </div>

                    <div className="info-item">
                      <span className="label">Email</span>
                      <span className="value">{infoForm.email}</span>
                    </div>

                    <div className="info-item">
                      <span className="label">Số điện thoại</span>
                      <span className="value">
                        {infoForm.numberPhone || "Chưa cập nhật"}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="label">Địa chỉ</span>
                      <span className="value">
                        {infoForm.address || "Chưa cập nhật"}
                      </span>
                    </div>

                    {user.role === "admin" && (
                      <div className="info-item">
                        <span className="label">Vai trò</span>
                        <span className="value role-admin">Admin</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PASSWORD TAB */}
            {activeTab === "password" && (
              <div className="tab-content password-tab">
                <form
                  className="password-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSavePassword();
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="oldPassword">Mật khẩu hiện tại</label>
                    <div className="password-input-wrapper">
                      <input
                        id="oldPassword"
                        type={showPasswords.old ? "text" : "password"}
                        name="oldPassword"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            old: !prev.old,
                          }))
                        }
                      >
                        <i
                          className={`fas fa-eye${
                            showPasswords.old ? "" : "-slash"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Mật khẩu mới</label>
                    <div className="password-input-wrapper">
                      <input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                      >
                        <i
                          className={`fas fa-eye${
                            showPasswords.new ? "" : "-slash"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      >
                        <i
                          className={`fas fa-eye${
                            showPasswords.confirm ? "" : "-slash"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="password-requirements">
                    <p>Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setPasswordForm({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setError("");
                      }}
                      disabled={savingPassword}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={savingPassword}
                    >
                      {savingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
