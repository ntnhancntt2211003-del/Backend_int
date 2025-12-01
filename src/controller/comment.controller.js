import Comment from "../models/comment.js";
import Product from "../models/products.js";

export const CreateComment = async (req, res) => {
  try {
    const { productId, content, rating, parentCommentId } = req.body;
    const userId = req.user.id;

    if (!productId || !content) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm và nội dung bình luận là bắt buộc",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    const comment = new Comment({
      productId,
      userId,
      content,
      rating: rating || 5,
      parentCommentId: parentCommentId || null,
    });

    await comment.save();

    // If this is a reply, add it to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: comment._id } },
        { new: true }
      );
    }

    // Populate user info
    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username avatar"
    );

    res.status(201).json({
      success: true,
      message: "Bình luận đã được tạo thành công",
      data: populatedComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bình luận",
      error: error.message,
    });
  }
};

export const GetComments = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp ID sản phẩm",
      });
    }

    // Get only parent comments (those without parentCommentId)
    const comments = await Comment.find({
      productId,
      parentCommentId: null,
    })
      .populate("userId", "username avatar email")
      .populate({
        path: "replies",
        populate: {
          path: "userId",
          select: "username avatar email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bình luận",
      error: error.message,
    });
  }
};

export const DeleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Bình luận không tồn tại",
      });
    }

    // Check if user is comment owner or admin
    if (comment.userId.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bình luận này",
      });
    }

    // If this is a reply, remove it from parent comment's replies
    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(
        comment.parentCommentId,
        { $pull: { replies: id } },
        { new: true }
      );
    }

    // Delete all replies if this is a parent comment
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Bình luận đã được xóa",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bình luận",
      error: error.message,
    });
  }
};

export const UpdateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Bình luận không tồn tại",
      });
    }

    // Check if user is comment owner
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa bình luận này",
      });
    }

    if (content) comment.content = content;
    if (rating) comment.rating = rating;
    comment.updatedAt = Date.now();

    await comment.save();

    const updatedComment = await Comment.findById(id).populate(
      "userId",
      "username avatar"
    );

    res.status(200).json({
      success: true,
      message: "Bình luận đã được cập nhật",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bình luận",
      error: error.message,
    });
  }
};
