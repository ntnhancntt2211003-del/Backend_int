import User from "../models/user.model.js";

// Follow a user
export const FollowUser = async (req, res) => {
  try {
    const { followUserId } = req.body;
    const currentUserId = req.user.id;

    if (!followUserId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp ID người dùng để theo dõi",
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(followUserId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Cannot follow yourself
    if (currentUserId === followUserId) {
      return res.status(400).json({
        success: false,
        message: "Không thể theo dõi chính mình",
      });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản hiện tại không tồn tại",
      });
    }

    // Check if already following
    if (currentUser.following.includes(followUserId)) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã theo dõi người dùng này",
      });
    }

    // Add to following list
    currentUser.following.push(followUserId);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: "Theo dõi người dùng thành công",
      data: currentUser,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi theo dõi người dùng",
      error: error.message,
    });
  }
};

// Unfollow a user
export const UnfollowUser = async (req, res) => {
  try {
    const { followUserId } = req.body;
    const currentUserId = req.user.id;

    if (!followUserId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp ID người dùng để bỏ theo dõi",
      });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản hiện tại không tồn tại",
      });
    }

    // Check if following
    if (!currentUser.following.includes(followUserId)) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa theo dõi người dùng này",
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== followUserId
    );
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: "Bỏ theo dõi người dùng thành công",
      data: currentUser,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi bỏ theo dõi người dùng",
      error: error.message,
    });
  }
};

// Get following list
export const GetFollowing = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp ID người dùng",
      });
    }

    // Get user with populated following list
    const user = await User.findById(userId)
      .populate("following", "username avatar numberPhone email address")
      .select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      data: user.following || [],
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách theo dõi",
      error: error.message,
    });
  }
};

// Get followers count
export const GetFollowersCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp ID người dùng",
      });
    }

    // Count how many users are following this user
    const followersCount = await User.countDocuments({
      following: userId,
    });

    // Get user's following count
    const user = await User.findById(userId).select("following");
    const followingCount = user?.following?.length || 0;

    res.status(200).json({
      success: true,
      data: {
        followers: followersCount,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching followers count:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy số lượng theo dõi",
      error: error.message,
    });
  }
};

// Check if user is following another user
export const IsFollowing = async (req, res) => {
  try {
    const { followUserId } = req.query;
    const currentUserId = req.user.id;

    if (!followUserId) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp ID người dùng",
      });
    }

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser?.following?.includes(followUserId);

    res.status(200).json({
      success: true,
      data: {
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error("Error checking following status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra trạng thái theo dõi",
      error: error.message,
    });
  }
};
