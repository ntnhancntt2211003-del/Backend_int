import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MessageList.scss";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:8080/api";

const MessageList = ({
  selectedConversation,
  onSelectConversation,
  onBack,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Refresh when onMessageSent is triggered
  useEffect(() => {
    if (refreshTrigger) {
      fetchConversations();
    }
  }, [refreshTrigger]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetch conversations response:", response.data);

      if (response.data.success) {
        setConversations(response.data.data);
        console.log("Conversations set:", response.data.data);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Không thể tải danh sách trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    // Handle case where conv.user might not exist
    const username = conv.user?.username || "";
    return username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTimeAgo = (date) => {
    const now = new Date();
    const time = new Date(date);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return time.toLocaleDateString("vi-VN");
  };

  const isUnread = (conv) => {
    return (
      conv.lastMessage &&
      conv.lastMessage.sender !== user?._id &&
      !conv.lastMessage.isRead
    );
  };

  return (
    <div className="message-list">
      <div className="message-list-header">
        <div className="header-title-section">
          {selectedConversation && (
            <button className="back-btn" onClick={onBack}>
              ← Quay lại
            </button>
          )}
          <h2>Nhắn tin</h2>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="conversations">
        {loading && !conversations.length ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="error">{error}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Chưa có cuộc trò chuyện nào</p>
            <small>Bắt đầu trò chuyện bằng cách nhắn tin cho ai đó</small>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            // Check if conversation has required data
            if (!conv.user || !conv.lastMessage) return null;

            return (
              <div
                key={conv._id}
                className={`conversation-item ${
                  selectedConversation?._id === conv._id ? "active" : ""
                } ${isUnread(conv) ? "unread" : ""}`}
                onClick={() => onSelectConversation(conv)}
              >
                <div className="conversation-avatar">
                  <img
                    src={conv.user.avatar || "/avatar/default.webp"}
                    alt={conv.user.username}
                    onError={(e) => {
                      e.target.src = "/avatar/default.webp";
                    }}
                  />
                  {isUnread(conv) && <span className="unread-badge"></span>}
                </div>

                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3 className="conversation-name">{conv.user.username}</h3>
                    <span className="message-time">
                      {formatTimeAgo(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="conversation-preview">
                    {conv.lastMessage.sender === user?._id ? "Bạn: " : ""}
                    {conv.lastMessage.content.substring(0, 50)}
                    {conv.lastMessage.content.length > 50 ? "..." : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageList;
