import Category from "../models/category.js";
import {
  DeleteCategoryById,
  GetAllListCategories,
} from "../service/categories.service.js";

const slugify = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s\/_]+/g, "-")
    .replace(/-+/g, "-");

export const GetCategories = async (req, res) => {
  try {
    const GetAllCategories = await GetAllListCategories();
    return res.status(200).json({ success: true, data: GetAllCategories });
  } catch (error) {
    console.error("GetCategories error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const CreateCategory = async (req, res) => {
  try {
    const { name, slug, parent, iconUrl } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: name" });

    const finalSlug =
      slug && typeof slug === "string" ? slugify(slug) : slugify(name);

    const exists = await Category.findOne({
      $or: [{ name }, { slug: finalSlug }],
    });
    if (exists)
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });

    const cat = new Category({
      name,
      slug: finalSlug,
      parent: parent || null,
      iconUrl: iconUrl || "",
    });
    await cat.save();
    return res.status(201).json({ success: true, data: cat });
  } catch (error) {
    console.error("CreateCategory error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const DeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing category ID" });
    }
    const deleted = await DeleteCategoryById(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("DeleteCategory error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
