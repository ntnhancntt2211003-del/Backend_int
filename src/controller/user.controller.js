import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendResetPasswordEmail,
  sendPasswordResetSuccessEmail,
} from "../service/email.service.js";
import {
  CreateProductNew,
  FindALLProduct,
} from "../service/product.service.js";
import {
  CheckUserExist,
  CreateUserNew,
  GetInforUser,
} from "../service/user.service.js";

export const GetAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
    console.error(error);
  }
};

export const CreateUser = async (req, res) => {
  try {
    const { username, email, password, avatar, numberPhone } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    }
    const exstingUser = await CheckUserExist(numberPhone, email);
    if (exstingUser) {
      return res
        .status(400)
        .json({ message: "NumberPhone or email already exists" });
    }
    // Tạo người dùng mới
    const newUSer = await CreateUserNew(
      username,
      email,
      password,
      avatar,
      numberPhone
    );
    console.log(newUSer);
    if (!newUSer) {
      return res.status(400).json({ message: "Failed to create user" });
    }
    await res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
    console.error(error);
  }
};

export const getInforUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const Infor = await GetInforUser(id);
    if (!Infor) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ infor: Infor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Public endpoint to get seller profile info (without auth)
export const getSellerProfilePublic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const user = await User.findById(id).select(
      "_id username email avatar numberPhone address"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password using bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      numberPhone: user.numberPhone,
      avatar: user.avatar,
      role: user.role,
    };

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const UpdateUserAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const { avatarUrl } = req.body;

    console.log("DEBUG: UpdateUserAvatar called");
    console.log("DEBUG: User ID:", id);
    console.log("DEBUG: Avatar URL length:", avatarUrl?.length);

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!avatarUrl) {
      return res.status(400).json({ message: "Avatar URL is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("DEBUG: Avatar updated successfully for user:", id);

    res.status(200).json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, numberPhone, address } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (numberPhone) updateData.numberPhone = numberPhone;
    if (address) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if old password matches
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    try {
      await sendResetPasswordEmail(email, resetUrl);
      res.status(200).json({
        success: true,
        message: "Link đặt lại mật khẩu đã được gửi đến email của bạn",
      });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Không thể gửi email. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mật khẩu",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không khớp",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    try {
      await sendPasswordResetSuccessEmail(user.email, user.username);
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }

    res.status(200).json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
