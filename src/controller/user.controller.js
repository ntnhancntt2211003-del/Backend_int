import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
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

    res.status(200).json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
