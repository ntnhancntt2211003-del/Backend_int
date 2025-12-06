import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Following.scss";

const Following = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const API_BASE_URL = "http://localhost:8080/api";
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchFollowData();
    }
  }, [targetUserId, activeTab]);

  const fetchFollowData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "followers") {
        const response = await axios.get(
          `${API_BASE_URL}/users/${targetUserId}/followers`
        );
        setFollowers(response.data.followers || []);
      } else {
        const response = await axios.get(
          `${API_BASE_URL}/users/${targetUserId}/following`
        );
        setFollowing(response.data.following || []);
      }
    } catch (err) {
      console.error("Error fetching follow data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/users/profile/${userId}`);
  };

  const handleRemoveFollower = async (followerId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa người theo dõi này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/users/${followerId}/remove-follower`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Reload followers list
      setFollowers(followers.filter((f) => f._id !== followerId));
      alert("Đã xóa người theo dõi thành công!");
    } catch (err) {
      console.error("Error removing follower:", err);
      alert("Có lỗi xảy ra khi xóa người theo dõi");
    }
  };

  const currentData = activeTab === "followers" ? followers : following;

  return (
    <div className="following-page">
      <div className="following-container">
        {/* Left Sidebar */}
        <div className="following-sidebar">
          <div className="sidebar-card">
            <div className="tabs-menu">
              <button
                className={`tab-menu-item ${
                  activeTab === "followers" ? "active" : ""
                }`}
                onClick={() => setActiveTab("followers")}
              >
                <span className="tab-icon">👥</span>
                <div className="tab-content">
                  <div className="tab-title">Người theo dõi</div>
                  <div className="tab-count">{followers.length} người</div>
                </div>
              </button>

              <button
                className={`tab-menu-item ${
                  activeTab === "following" ? "active" : ""
                }`}
                onClick={() => setActiveTab("following")}
              >
                <span className="tab-icon">⭐</span>
                <div className="tab-content">
                  <div className="tab-title">Đang theo dõi</div>
                  <div className="tab-count">{following.length} người</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="following-content">
          <div className="content-header">
            <h2 className="content-title">
              {activeTab === "followers"
                ? "Người theo dõi của bạn"
                : "Danh sách đang theo dõi"}
            </h2>
            <p className="content-count">
              {currentData.length}{" "}
              {activeTab === "followers"
                ? "người theo dõi"
                : "người đang theo dõi"}
            </p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : currentData.length > 0 ? (
            <div className="users-container">
              {currentData.map((followUser) => (
                <div
                  key={followUser._id}
                  className="user-item"
                  onMouseEnter={() => setSelectedUser(followUser._id)}
                  onMouseLeave={() => setSelectedUser(null)}
                >
                  <div className="user-item-header">
                    <img
                      src={followUser.avatar || "/avatar/default.webp"}
                      alt={followUser.username}
                      className="user-avatar-sm"
                      onError={(e) => {
                        e.target.src = "/avatar/default.webp";
                      }}
                    />
                    <div className="user-meta">
                      <h3 className="user-name">{followUser.username}</h3>
                      <p className="user-email">
                        {followUser.email || "Không có email"}
                      </p>
                    </div>
                  </div>

                  <div className="user-actions">
                    <button
                      className="btn-profile"
                      onClick={() => handleViewProfile(followUser._id)}
                    >
                      Xem trang
                    </button>
                    {activeTab === "followers" && (
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveFollower(followUser._id)}
                        title="Xóa người theo dõi"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === "followers" ? "📭" : "⭐"}
              </div>
              <h3>
                {activeTab === "followers"
                  ? "Chưa có người nào theo dõi"
                  : "Chưa theo dõi ai"}
              </h3>
              <p>
                {activeTab === "followers"
                  ? "Hãy chia sẻ danh sách sản phẩm của bạn để được mọi người theo dõi"
                  : "Theo dõi những người bán hàng để cập nhật sản phẩm mới"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Following;
