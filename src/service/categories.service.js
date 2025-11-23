import mongoose from "mongoose";
import Category from "../models/category.js";

export const DeleteCategoryById = async (IdCategories) => {
  if (!mongoose.isValidObjectId(IdCategories)) {
    throw new Error("Invalid category ID");
  }
  try {
    const deleted = await Category.findByIdAndDelete(IdCategories);
    return deleted;
  } catch (error) {
    console.error("DeleteCategoryById error:", error);
    throw new Error("Error deleting category: " + error.message);
  }
};

export const GetAllListCategories = async () => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .select("_id name slug iconUrl");
    return categories;
  } catch (error) {
    console.error("GetCategories error:", error);
    throw new Error("Error fetching categories: " + error.message);
  }
};
