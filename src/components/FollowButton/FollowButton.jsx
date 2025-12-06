import { useState, useEffect } from "react";
import axios from "axios";
import "./FollowButton.scss";

const FollowButton = ({ userId, currentUserId, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8080/api";

  // Check follow status on mount
  useEffect(() => {
    if (currentUserId && userId && currentUserId !== userId) {
      checkFollowStatus();
    }
  }, [userId, currentUserId]);

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/is-following`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(response.data.isFollowing);
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  };

  const handleFollowClick = async () => {
    if (!currentUserId) {
      alert("Vui lòng đăng nhập để theo dõi");
      return;
    }

    if (currentUserId === userId) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing
        ? `${API_BASE_URL}/users/${userId}/unfollow`
        : `${API_BASE_URL}/users/${userId}/follow`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsFollowing(!isFollowing);

      if (onFollowChange) {
        onFollowChange({
          isFollowing: !isFollowing,
          followerCount: response.data.followers || 0,
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (currentUserId === userId) {
    return null;
  }

  return (
    <button
      className={`btn-follow ${isFollowing ? "following" : ""}`}
      onClick={handleFollowClick}
      disabled={loading}
    >
      <span>
        {loading
          ? "Đang cập nhật..."
          : isFollowing
          ? "✓ Đang theo dõi"
          : "+ Theo dõi"}
      </span>
    </button>
  );
};

export default FollowButton;
