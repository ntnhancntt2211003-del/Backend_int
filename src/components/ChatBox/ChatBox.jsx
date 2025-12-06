import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatBox.scss";
import { useAuth } from "../../context/AuthContext";
import { FiSend, FiLoader } from "react-icons/fi";

const API_BASE_URL = "http://localhost:8080/api";

const ChatBox = ({ conversation, onBack, onMessageSent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch recipient info if conversation only has _id (placeholder)
  useEffect(() => {
    const fetchRecipientInfo = async () => {
      if (!conversation || conversation.user) return; // Already have user info or no conversation

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/users/${conversation._id}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          setRecipientInfo(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching recipient info:", err);
      }
    };

    fetchRecipientInfo();
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversation]);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!conversation) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Use conversation._id if available, otherwise use conversation._id as user ID
      const conversationId = conversation._id;
      const response = await axios.get(
        `${API_BASE_URL}/messages/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      // Don't set error for new conversations without messages yet
      if (err.response?.status !== 404) {
        setError("Không thể tải tin nhắn");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/messages/send`,
        {
          receiverId: conversation._id,
          content: messageInput.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setMessageInput("");
        setError(null);
        setShouldAutoScroll(true); // Auto scroll when sending message
        // Trigger conversation list refresh
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const time = new Date(date);
    return time.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const time = new Date(date);
    return time.toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isNewDay = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  if (!conversation) {
    return (
      <div className="chat-box empty">
        <div className="empty-chat">
          <div className="empty-icon">💬</div>
          <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
        </div>
      </div>
    );
  }

  // Check if it's a placeholder conversation (only has _id)
  const isPlaceholder = !conversation.user;
  const displayUser = conversation.user || recipientInfo;

  return (
    <div className="chat-box">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          ← Quay lại
        </button>
        <div className="chat-user-info">
          {isPlaceholder && !displayUser ? (
            <>
              <div className="chat-avatar placeholder-avatar">?</div>
              <div className="user-details">
                <h3>Cuộc trò chuyện mới</h3>
                <p>Bắt đầu nhắn tin</p>
              </div>
            </>
          ) : (
            <>
              <img
                src={displayUser?.avatar || "/avatar/default.webp"}
                alt={displayUser?.username}
                className="chat-avatar"
                onError={(e) => {
                  e.target.src = "/avatar/default.webp";
                }}
              />
              <div className="user-details">
                <h3>{displayUser?.username || "Người dùng"}</h3>
                <p>{displayUser?.email || ""}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {loading && !messages.length ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải tin nhắn...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-conversation">
            <div className="empty-icon">👋</div>
            <p>Chưa có tin nhắn nào</p>
            <small>Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn</small>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isSent =
                String(message.sender?._id) === String(user?._id || user?.id);
              console.log("Message comparison:", {
                senderID: String(message.sender?._id),
                userID: String(user?._id || user?.id),
                userObj: user,
                isSent,
                senderObj: message.sender,
              });
              return (
                <React.Fragment key={message._id}>
                  {isNewDay(message, messages[index - 1]) && (
                    <div className="date-separator">
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                  )}
                  <div className={`message ${isSent ? "sent" : "received"}`}>
                    {!isSent && (
                      <img
                        src={message.sender.avatar || "/avatar/default.webp"}
                        alt={message.sender.username || "User"}
                        className="message-avatar"
                        onError={(e) => {
                          e.target.src = "/avatar/default.webp";
                        }}
                      />
                    )}
                    <div className="message-content">
                      <p className="message-text">{message.content}</p>
                      <span className="message-time">
                        {formatTime(message.createdAt)}
                        {isSent && (
                          <span
                            className={`read-status ${
                              message.isRead ? "read" : "sent"
                            }`}
                          >
                            {message.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={sending}
            className="message-input"
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="send-btn"
            title="Gửi tin nhắn"
          >
            {sending ? (
              <FiLoader size={20} className="icon-loading" />
            ) : (
              <FiSend size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
