import React, { useState, useEffect } from "react";
import MessageList from "../../components/MessageList";
import ChatBox from "../../components/ChatBox";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Messaging.scss";

const Messaging = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [allConversations, setAllConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // Fetch conversations and auto-select if chat param exists
  useEffect(() => {
    const fetchAndSelectConversation = async () => {
      const chatParam = searchParams.get("chat");

      if (!chatParam || !user) return;

      try {
        setLoadingConversations(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8080/api/messages/conversations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAllConversations(data.data);

            // Find or create conversation with the user
            const existingConv = data.data.find(
              (conv) => conv._id === chatParam || conv.user._id === chatParam
            );

            if (existingConv) {
              // Conversation exists, select it
              setSelectedConversation(existingConv);
            } else {
              // Conversation doesn't exist, create a placeholder
              // This will prompt the user to send first message
              const userToChat = { _id: chatParam };
              setSelectedConversation(userToChat);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchAndSelectConversation();
  }, [searchParams, user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackFromChat = () => {
    setSelectedConversation(null);
  };

  const handleBackFromList = () => {
    navigate(-1);
  };

  const refreshConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/messages/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAllConversations(data.data);
          // Trigger MessageList to refresh
          setRefreshTrigger((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    }
  };

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        {/* Message List - Show on desktop, hide when chat is selected on mobile */}
        {!isMobileView || !selectedConversation ? (
          <div className="message-list-section">
            <MessageList
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onBack={handleBackFromList}
              refreshTrigger={refreshTrigger}
            />
          </div>
        ) : null}

        {/* Chat Box - Show on desktop alongside list, show on mobile when selected */}
        {!isMobileView || selectedConversation ? (
          <div className="chat-box-section">
            <ChatBox
              conversation={selectedConversation}
              onBack={handleBackFromChat}
              onMessageSent={refreshConversations}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Messaging;
