import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import "./Profile.scss";

const Profile = () => {
  const { user, token } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || "/avatar/default.webp");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một file hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload to server (you need to setup a file upload endpoint)
      // For now, we'll use a base64 approach or image CDN
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const avatarUrl = event.target.result; // Base64 or URL

          // Send to backend
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

          const data = await response.json();

          if (response.ok) {
            setAvatar(avatarUrl);
            setSuccess("Cập nhật ảnh đại diện thành công!");
          } else {
            setError(data.message || "Lỗi cập nhật ảnh đại diện");
          }
        } catch (err) {
          setError("Lỗi: " + err.message);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError("Lỗi upload: " + err.message);
      setUploading(false);
    }
  };

  const handleAvatarReset = () => {
    setAvatar("/avatar/default.webp");
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Hồ sơ của tôi</h1>
        </div>

        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img
              src={avatar}
              alt="Avatar"
              className="avatar-image"
              onError={(e) => {
                e.target.src = "/avatar/default.webp";
              }}
            />
            <label htmlFor="avatar-input" className="avatar-upload-btn">
              <i className="fas fa-camera"></i>
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="avatar-info">
            <p className="info-text">Tối đa 5MB, định dạng: JPG, PNG, WebP</p>
            {avatar !== "/avatar/default.webp" && (
              <button
                className="btn-reset"
                onClick={handleAvatarReset}
                disabled={uploading}
              >
                Khôi phục ảnh mặc định
              </button>
            )}
          </div>
        </div>

        {/* User Info Section */}
        {user && (
          <div className="user-info-section">
            <h2>Thông tin cá nhân</h2>

            <div className="info-group">
              <label>Tên người dùng</label>
              <input type="text" value={user.username} readOnly />
            </div>

            <div className="info-group">
              <label>Email</label>
              <input type="email" value={user.email} readOnly />
            </div>

            <div className="info-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={user.numberPhone || "Chưa cập nhật"}
                readOnly
              />
            </div>

            {user.role === "admin" && (
              <div className="info-group">
                <label>Vai trò</label>
                <input
                  type="text"
                  value="Admin"
                  readOnly
                  className="role-admin"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
