import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import multer from "multer";
import ImageProduct from "../models/imageProducts.js";
import Product from "../models/products.js";

let gridfsBucket;

// Initialize GridFS bucket
const initGridFS = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not established");
  }
  gridfsBucket = new GridFSBucket(db, { bucketName: "uploads" });
  return gridfsBucket;
};

// Get GridFS bucket
const getGridFSBucket = () => {
  if (!gridfsBucket) {
    gridfsBucket = initGridFS();
  }
  return gridfsBucket;
};

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 4, // max 4 files (1 main + 3 additional)
    parts: 10, // max form parts
  },
  onError: (err, next) => {
    console.error("Multer error:", err);
    next(err);
  },
});

// Helper function to upload file to GridFS
const uploadFileToGridFS = (filename, fileBuffer, metadata = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: metadata,
      });

      uploadStream.on("error", (error) => {
        console.error("GridFS upload error:", error);
        reject(error);
      });

      uploadStream.on("finish", () => {
        console.log(
          "File uploaded successfully to GridFS with ID:",
          uploadStream.id
        );
        resolve({
          id: uploadStream.id,
          filename: filename,
          metadata: metadata,
        });
      });

      uploadStream.end(fileBuffer);
    } catch (error) {
      console.error("Error creating GridFS upload stream:", error);
      reject(error);
    }
  });
};

// Helper to convert GridFS file ID to URL
const fileIdToUrl = (fileId) =>
  `http://localhost:8080/api/images/file/${fileId}`;

// Serve GridFS file by ID
export const ServeGridFSFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log("=== Serving GridFS File ===");
    console.log("File ID:", fileId);

    const bucket = getGridFSBucket();
    const db = mongoose.connection.db;

    // Get file info
    const fileInfo = await db.collection("uploads.files").findOne({
      _id: new mongoose.Types.ObjectId(fileId),
    });

    if (!fileInfo) {
      console.log("File not found in GridFS:", fileId);
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    console.log(
      "File found:",
      fileInfo.filename,
      "Type:",
      fileInfo.metadata?.mimetype
    );

    // Set headers
    res.set({
      "Content-Type": fileInfo.metadata?.mimetype || "application/octet-stream",
      "Content-Length": fileInfo.length,
      "Content-Disposition": `inline; filename="${fileInfo.filename}"`,
      "Cache-Control": "public, max-age=31536000",
    });

    // Stream file
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    downloadStream.on("error", (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
      }
    });

    downloadStream.on("end", () => {
      console.log("File stream completed:", fileId);
    });

    console.log("Starting file stream for:", fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("File serve error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error serving file",
        error: error.message,
      });
    }
  }
};

export const GetAllImages = async (req, res) => {
  try {
    console.log("=== Getting All Images ===");

    // Get all image records
    const imageRecords = await ImageProduct.find({});
    console.log("Found image records:", imageRecords.length);

    // Get GridFS file count
    const db = mongoose.connection.db;
    const files = await db.collection("uploads.files").find({}).toArray();
    console.log("GridFS files count:", files.length);

    res.status(200).json({
      success: true,
      data: {
        imageRecords,
        gridfsFiles: files.map((f) => ({
          _id: f._id,
          filename: f.filename,
          length: f.length,
          uploadDate: f.uploadDate,
          metadata: f.metadata,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting all images:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetImagesByProduct = async (req, res) => {
  try {
    const { id } = req.params; // Product ID
    const doc = await ImageProduct.findOne({ productId: id });

    if (!doc) {
      // Return empty data instead of 404 for better UX
      return res.status(200).json({
        success: true,
        data: {
          productId: id,
          mainImageUrl: null,
          additionalImageUrls: [],
          mainImageFileId: null,
          additionalImageFileIds: [],
        },
        message: "No images found for this product",
      });
    }

    // Convert GridFS file IDs to URLs
    const responseData = {
      ...doc.toObject(),
      mainImageUrl: doc.mainImageFileId
        ? fileIdToUrl(doc.mainImageFileId)
        : null,
      additionalImageUrls: doc.additionalImageFileIds.map((fileId) =>
        fileIdToUrl(fileId)
      ),
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Accept JSON body: { mainImageFileId: string, additionalImageFileIds: [string] }
export const UpsertImagesJson = async (req, res) => {
  try {
    const { id } = req.params; // Product ID
    const { mainImageFileId, additionalImageFileIds } = req.body;

    // Basic validation
    if (!id || !mainImageFileId)
      return res.status(400).json({
        success: false,
        message: "Product ID and mainImageFileId are required",
      });

    const product = await Product.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const additional = Array.isArray(additionalImageFileIds)
      ? additionalImageFileIds.slice(0, 3)
      : [];

    // Validate that the file IDs are valid ObjectIds
    try {
      new mongoose.Types.ObjectId(mainImageFileId);
      additional.forEach((fileId) => new mongoose.Types.ObjectId(fileId));
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID format",
      });
    }

    const updated = await ImageProduct.findOneAndUpdate(
      { productId: id },
      {
        $set: {
          mainImageFileId: mainImageFileId,
          additionalImageFileIds: additional,
        },
      },
      { upsert: true, new: true }
    );

    // Return with URLs for frontend consumption
    const responseData = {
      ...updated.toObject(),
      mainImageUrl: fileIdToUrl(updated.mainImageFileId),
      additionalImageUrls: updated.additionalImageFileIds.map((fileId) =>
        fileIdToUrl(fileId)
      ),
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Upload files: fields: mainImage (single), additionalImages (up to 3)
export const uploadMiddleware = (req, res, next) => {
  // Log incoming request details
  console.log("=== Upload Middleware Debug ===");
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Check if there's actually data in the request
  if (!req.headers["content-length"] || req.headers["content-length"] === "0") {
    return res.status(400).json({
      success: false,
      message: "No file data received. Content-Length is 0.",
      debug: {
        contentType: req.headers["content-type"],
        contentLength: req.headers["content-length"],
      },
    });
  }

  // Use multer.any() to accept any field names, then we'll organize them in the controller
  const uploadHandler = upload.any();

  uploadHandler(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);

      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FILE_SIZE":
            return res.status(400).json({
              success: false,
              message: "File size too large. Maximum 10MB allowed.",
            });
          case "LIMIT_FILE_COUNT":
            return res.status(400).json({
              success: false,
              message: "Too many files. Maximum 4 files allowed.",
            });
          case "LIMIT_UNEXPECTED_FILE":
            return res.status(400).json({
              success: false,
              message: "Unexpected field name in form data.",
            });
          default:
            return res.status(400).json({
              success: false,
              message: `Upload error: ${err.message}`,
            });
        }
      }

      // Handle other errors like "Unexpected end of form"
      if (err.message && err.message.includes("Unexpected end of form")) {
        return res.status(400).json({
          success: false,
          message: "Form data incomplete. Please try uploading again.",
        });
      }

      return res.status(500).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    }

    // Organize files by fieldname for easier processing
    if (req.files && Array.isArray(req.files)) {
      const organizedFiles = {};
      req.files.forEach((file) => {
        if (!organizedFiles[file.fieldname]) {
          organizedFiles[file.fieldname] = [];
        }
        organizedFiles[file.fieldname].push(file);
      });
      req.files = organizedFiles;
      console.log("=== Organized files in middleware ===");
      console.log("Field names:", Object.keys(organizedFiles));
      Object.keys(organizedFiles).forEach((fieldName) => {
        console.log(
          `${fieldName}:`,
          organizedFiles[fieldName].map((f) => f.originalname)
        );
      });
    } else if (req.files) {
      console.log(
        "req.files is already organized as object:",
        Object.keys(req.files)
      );
    } else {
      console.log("No files received in middleware");
    }

    next();
  });
};

// Upload images for product
export const UpsertImagesUpload = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log("=== UpsertImagesUpload ===");
    console.log("Product ID:", productId);
    console.log("User ID:", userId);
    console.log("User Role:", userRole);

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists and user has permission
    const Product = (await import("../models/products.js")).default;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user is admin or owner
    if (userRole !== "admin" && product.IdOnwer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền upload ảnh cho sản phẩm này",
      });
    }

    console.log("req.files type:", typeof req.files);
    console.log(
      "req.files keys:",
      req.files ? Object.keys(req.files) : "undefined"
    );
    console.log(
      "Files received:",
      req.files?.mainImage?.length || 0,
      "main images"
    );
    console.log("Additional images:", req.files?.additionalImages?.length || 0);

    // req.files is now an object organized by fieldname (from middleware)
    const mainImageArray = req.files?.mainImage || [];
    const additionalImagesArray = req.files?.additionalImages || [];

    const mainImage = mainImageArray.length > 0 ? mainImageArray[0] : null;
    const additionalImages = additionalImagesArray || [];

    console.log("Main image:", mainImage ? mainImage.originalname : "none");
    console.log("Additional images count:", additionalImages.length);

    // Get existing images
    const existingImages = await ImageProduct.findOne({ productId });
    console.log("Existing images:", existingImages);

    const bucket = getGridFSBucket();

    // Only update if new files are provided
    let updateData = { productId };

    if (mainImage) {
      console.log("Uploading main image:", mainImage.originalname);
      const result = await uploadFileToGridFS(
        mainImage.originalname,
        mainImage.buffer,
        {
          productId,
          type: "main",
        }
      );
      updateData.mainImageFileId = result.id;
      updateData.mainImageUrl = fileIdToUrl(result.id);
      console.log("Main image uploaded with ID:", result.id);
    } else if (existingImages?.mainImageFileId) {
      // Keep existing main image if no new one provided
      console.log("Keeping existing main image");
      updateData.mainImageFileId = existingImages.mainImageFileId;
      updateData.mainImageUrl = existingImages.mainImageUrl;
    }

    if (additionalImages.length > 0) {
      console.log("Uploading", additionalImages.length, "additional images");
      const additionalImageFileIds = [];
      const additionalImageUrls = [];

      for (const file of additionalImages) {
        console.log("Uploading additional image:", file.originalname);
        const result = await uploadFileToGridFS(
          file.originalname,
          file.buffer,
          {
            productId,
            type: "additional",
          }
        );
        additionalImageFileIds.push(result.id);
        additionalImageUrls.push(fileIdToUrl(result.id));
        console.log("Additional image uploaded with ID:", result.id);
      }

      updateData.additionalImageFileIds = additionalImageFileIds;
      updateData.additionalImageUrls = additionalImageUrls;
    } else if (existingImages?.additionalImageFileIds?.length > 0) {
      // Keep existing additional images if no new ones provided
      console.log(
        "Keeping existing",
        existingImages.additionalImageFileIds.length,
        "additional images"
      );
      updateData.additionalImageFileIds = existingImages.additionalImageFileIds;
      updateData.additionalImageUrls = existingImages.additionalImageUrls;
    }

    console.log("Update data:", updateData);

    const result = await ImageProduct.findOneAndUpdate(
      { productId },
      updateData,
      {
        upsert: true,
        new: true,
      }
    );

    console.log("Updated image record:", result);

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        productId,
        mainImageFileId: result.mainImageFileId,
        mainImageUrl: result.mainImageUrl,
        additionalImageFileIds: result.additionalImageFileIds,
        additionalImageUrls: result.additionalImageUrls,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteImages = async (req, res) => {
  try {
    const { id } = req.params;
    const bucket = getGridFSBucket();
    const images = await ImageProduct.findOne({ productId: id });

    if (!images) {
      return res
        .status(404)
        .json({ success: false, message: "No images found" });
    }

    if (images.mainImageFileId) await bucket.delete(images.mainImageFileId);
    if (images.additionalImageFileIds?.length > 0) {
      for (const fileId of images.additionalImageFileIds) {
        await bucket.delete(fileId);
      }
    }

    await ImageProduct.deleteOne({ productId: id });
    return res.status(200).json({ success: true, message: "Images deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
