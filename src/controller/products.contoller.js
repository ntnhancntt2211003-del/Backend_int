import mongoose from "mongoose";
import Category from "../models/category.js";
import Product from "../models/products.js";
import {
  CreateProductNew,
  FindALLProduct,
} from "../service/product.service.js";

export const CreateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      address,
      IdOnwer,
      quantity,
      contactName,
      contactPhone,
      condition,
    } = req.body;
    console.log("=== Creating Product ===");
    console.log("Received data:", {
      name,
      description,
      price: price,
      priceType: typeof price,
      category,
      address,
      quantity,
      IdOnwer,
      contactName,
      contactPhone,
      condition,
    });

    if (!name || !description || !price || !category || !address || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!IdOnwer) {
      return res.status(400).json({ message: "User ID (IdOnwer) is required" });
    }

    // Ensure price is a number
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: "Invalid price value" });
    }

    // Ensure quantity is a number
    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 1) {
      return res.status(400).json({ message: "Invalid quantity value" });
    }

    // resolve category input: can be ObjectId, slug, or name
    let categoryId = null;
    if (mongoose.isValidObjectId(category)) {
      const catDoc = await Category.findById(category);
      if (catDoc) categoryId = catDoc._id;
    } else {
      // try slug first, then name
      const catDoc =
        (await Category.findOne({ slug: category })) ||
        (await Category.findOne({ name: category }));
      if (catDoc) categoryId = catDoc._id;
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const NewProduct = await CreateProductNew(
      name || "",
      description || "",
      numericPrice, // Use validated numeric price
      categoryId,
      address || "cantho",
      IdOnwer, // Pass the owner ID
      numericQuantity, // Pass the quantity
      contactName || "", // Pass contact name
      contactPhone || "", // Pass contact phone
      condition || "new" // Pass condition
    );

    console.log("Product created successfully:", {
      id: NewProduct._id,
      name: NewProduct.name,
      price: NewProduct.price,
      quantity: NewProduct.quantity,
      owner: NewProduct.IdOnwer,
      contactName: NewProduct.contactName,
      contactPhone: NewProduct.contactPhone,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: {
        _id: NewProduct._id,
        name: NewProduct.name,
        description: NewProduct.description,
        price: NewProduct.price,
        quantity: NewProduct.quantity,
        category: NewProduct.category,
        address: NewProduct.address,
        IdOnwer: NewProduct.IdOnwer,
      },
      productId: NewProduct._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
    console.error(error);
  }
};

export const GetALLProduct = async (req, res) => {
  try {
    const { idOwner } = req.query;
    const filter = {};

    if (idOwner) {
      filter.IdOnwer = idOwner;
    }

    const products = await FindALLProduct(filter);
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
    console.error(error);
  }
};

export const GetProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id)
      .populate("category", "name slug iconUrl")
      .populate("IdOnwer", "username avatar email numberPhone");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
    console.error(error);
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From verified token
    const userRole = req.user.role; // From verified token

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is admin or owner
    if (userRole !== "admin" && product.IdOnwer.toString() !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa sản phẩm này",
      });
    }

    // Delete associated images from GridFS and database
    // We'll use a simpler approach - import the required models and functions
    try {
      const ImageProduct = (await import("../models/imageProducts.js")).default;
      const { GridFSBucket } = await import("mongodb");

      // Find and delete images
      const images = await ImageProduct.findOne({ productId: id });
      if (images) {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });

        // Delete main image
        if (images.mainImageFileId) {
          try {
            await bucket.delete(images.mainImageFileId);
            console.log("Deleted main image:", images.mainImageFileId);
          } catch (err) {
            console.warn("Error deleting main image:", err.message);
          }
        }

        // Delete additional images
        if (
          images.additionalImageFileIds &&
          images.additionalImageFileIds.length > 0
        ) {
          for (const fileId of images.additionalImageFileIds) {
            try {
              await bucket.delete(fileId);
              console.log("Deleted additional image:", fileId);
            } catch (err) {
              console.warn("Error deleting additional image:", err.message);
            }
          }
        }

        // Delete image record from database
        await ImageProduct.deleteOne({ productId: id });
        console.log(`Successfully deleted all images for product ${id}`);
      }
    } catch (imageError) {
      console.warn("Error deleting product images:", imageError.message);
      // Continue with product deletion even if image deletion fails
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

export const UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      address,
      quantity,
      status,
      contactName,
      contactPhone,
      condition,
      postingFee,
    } = req.body;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check authorization
    if (product.IdOnwer.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (address) product.address = address;
    if (quantity) product.quantity = Number(quantity);
    if (contactName) product.contactName = contactName;
    if (contactPhone) product.contactPhone = contactPhone;
    if (condition) product.condition = condition;
    if (postingFee !== undefined) product.postingFee = Number(postingFee);
    if (status && ["active", "sold"].includes(status)) {
      product.status = status;
    }

    // Update category if provided
    if (category) {
      let categoryId = null;
      if (mongoose.isValidObjectId(category)) {
        const catDoc = await Category.findById(category);
        if (catDoc) categoryId = catDoc._id;
      } else {
        const catDoc =
          (await Category.findOne({ slug: category })) ||
          (await Category.findOne({ name: category }));
        if (catDoc) categoryId = catDoc._id;
      }
      if (categoryId) {
        product.category = categoryId;
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};
