import Product from "../models/products.js";
import Category from "../models/category.js";

export const CreateProductNew = async (
  name,
  description,
  price,
  category,
  address,
  IdOnwer
) => {
  try {
    if (!name || !description || !price || !category || !address) {
      throw new Error("All fields are required");
    }
    if (!IdOnwer) {
      throw new Error("User ID (IdOnwer) is required");
    }
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new Error("Invalid category");
    }
    const product = new Product({
      name,
      description,
      price,
      category,
      address,
      IdOnwer,
    });
    await product.save();
    return product;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating product: " + error.message);
  }
};

export const FindALLProduct = async () => {
  try {
    const products = await Product.find().populate(
      "category",
      "name slug iconUrl"
    );
    return products;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching products: " + error.message);
  }
};
