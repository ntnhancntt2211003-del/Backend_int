import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  iconUrl: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;
