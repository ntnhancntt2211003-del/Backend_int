import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  quantity: { type: Number, default: 0 },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  contactName: { type: String },
  contactPhone: { type: String },
  condition: {
    type: String,
    enum: ["new", "like-new", "used"],
    default: "new",
  },
  status: { type: String, enum: ["active", "sold"], default: "active" },
  postingFee: { type: Number, default: null },
  isHidden: { type: Boolean, default: false },
  hiddenReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  IdOnwer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
