import User from "../models/user.model.js";

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: "Successfully followed user",
      following: currentUser.following.length,
      followers: userToFollow.followers.length,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      message: "Successfully unfollowed user",
      following: currentUser.following.length,
      followers: userToUnfollow.followers.length,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get followers list
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("followers", [
      "id",
      "username",
      "avatar",
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followerCount: user.followers?.length || 0,
      followers: user.followers || [],
    });
  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get following list
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("following", [
      "id",
      "username",
      "avatar",
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followingCount: user.following?.length || 0,
      following: user.following || [],
    });
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user is following another user
export const isFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowingUser = currentUser.following.includes(userId);

    res.status(200).json({ isFollowing: isFollowingUser });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove a follower (delete follower from your account)
export const removeFollower = async (req, res) => {
  try {
    const { userId } = req.params; // The follower to remove
    const currentUserId = req.user?.id; // The account owner

    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const followerUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!followerUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.followers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "This user is not your follower" });
    }

    // Remove from followers list
    currentUser.followers = currentUser.followers.filter(
      (id) => id.toString() !== userId
    );

    // Remove from follower's following list
    followerUser.following = followerUser.following.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await followerUser.save();

    res.status(200).json({
      message: "Successfully removed follower",
      followers: currentUser.followers.length,
    });
  } catch (error) {
    console.error("Error removing follower:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
