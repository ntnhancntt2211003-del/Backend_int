import Message from "../models/message.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // Validation
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp receiverId và nội dung tin nhắn",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "Không thể gửi tin nhắn cho chính mình",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Người nhận không tồn tại",
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    await message.save();
    await message.populate([
      { path: "sender", select: "username avatar email" },
      { path: "receiver", select: "username avatar email" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Gửi tin nhắn thành công",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi gửi tin nhắn",
      error: error.message,
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    // Get all messages between two users (both directions)
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      $and: [
        {
          $or: [
            { deletedBySender: false, sender: currentUserId },
            { deletedByReceiver: false, receiver: currentUserId },
            { sender: otherUserId },
            { receiver: otherUserId },
          ],
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar email")
      .populate("receiver", "username avatar email");

    // Mark messages as read if received by current user
    await Message.updateMany(
      {
        receiver: currentUserId,
        sender: otherUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error getting conversation:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy tin nhắn",
      error: error.message,
    });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all messages involving current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar email")
      .populate("receiver", "username avatar email");

    // Group messages by conversation (other user)
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUserId =
        msg.sender._id.toString() === currentUserId
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!conversationMap.has(otherUserId)) {
        const otherUser =
          msg.sender._id.toString() === currentUserId
            ? msg.receiver
            : msg.sender;
        conversationMap.set(otherUserId, {
          _id: otherUser._id,
          user: {
            _id: otherUser._id,
            username: otherUser.username,
            avatar: otherUser.avatar,
            email: otherUser.email,
          },
          lastMessage: {
            _id: msg._id,
            content: msg.content,
            sender: msg.sender._id,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
          },
        });
      }
    });

    const conversationUsers = Array.from(conversationMap.values());

    console.log("Conversations:", conversationUsers);

    return res.status(200).json({
      success: true,
      data: conversationUsers,
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách trò chuyện",
      error: error.message,
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Tin nhắn không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật trạng thái tin nhắn",
      error: error.message,
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Tin nhắn không tồn tại",
      });
    }

    // Only sender or receiver can delete
    if (
      message.sender.toString() !== currentUserId &&
      message.receiver.toString() !== currentUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền xóa tin nhắn này",
      });
    }

    // Soft delete
    if (message.sender.toString() === currentUserId) {
      message.deletedBySender = true;
    } else {
      message.deletedByReceiver = true;
    }

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Xóa tin nhắn thành công",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xóa tin nhắn",
      error: error.message,
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy số tin nhắn chưa đọc",
      error: error.message,
    });
  }
};
