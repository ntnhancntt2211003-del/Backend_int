import Ad from "../models/ad.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../public/uploads/ads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create new ad
export const CreateAd = async (req, res) => {
  try {
    const { type, caption, price } = req.body;
    const userId = req.user.id;

    if (!type || !["image", "video"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ad type" });
    }

    const ad = new Ad({
      type,
      caption: caption || "",
      price: price ? Number(price) : 0,
      createdBy: userId,
    });

    // Handle image upload - multer stores in destination folder directly
    if (type === "image" && req.files?.image) {
      const imageFile = req.files.image[0];
      // File is already saved by multer in the destination folder
      // We just need to store the relative path (without /public prefix)
      ad.imageUrl = `/uploads/ads/${imageFile.filename}`;
    }

    // Handle video upload - multer stores in destination folder directly
    if (type === "video" && req.files?.video) {
      const videoFile = req.files.video[0];
      // File is already saved by multer in the destination folder
      // We just need to store the relative path (without /public prefix)
      ad.videoUrl = `/uploads/ads/${videoFile.filename}`;
    }

    // Validate that file was uploaded
    if (!ad.imageUrl && !ad.videoUrl) {
      return res.status(400).json({
        success: false,
        message: "No image or video file provided",
      });
    }

    await ad.save();
    await ad.populate("createdBy", "username email");

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      data: ad,
    });
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating ad",
    });
  }
};

// Get all active ads
export const GetAds = async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true })
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching ads",
    });
  }
};

// Get all ads (including inactive) - for admin
export const GetAllAds = async (req, res) => {
  try {
    const ads = await Ad.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching ads",
    });
  }
};

// Get single ad
export const GetAdById = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findById(id).populate("createdBy", "username email");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching ad",
    });
  }
};

// Update ad
export const UpdateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, price, isActive } = req.body;
    const userId = req.user.id;

    const ad = await Ad.findById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership
    if (ad.createdBy.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (caption !== undefined) ad.caption = caption;
    if (price !== undefined) ad.price = Number(price);
    if (isActive !== undefined) ad.isActive = isActive;

    await ad.save();
    await ad.populate("createdBy", "username email");

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      data: ad,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating ad",
    });
  }
};

// Delete ad
export const DeleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findById(id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership
    if (ad.createdBy.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Delete files
    if (ad.imageUrl) {
      const imagePath = path.join(
        __dirname,
        "../../",
        ad.imageUrl.replace(/\//g, path.sep)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (ad.videoUrl) {
      const videoPath = path.join(
        __dirname,
        "../../",
        ad.videoUrl.replace(/\//g, path.sep)
      );
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Ad.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting ad",
    });
  }
};
