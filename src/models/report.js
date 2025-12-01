import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    enum: [
      "fake_product",
      "scam",
      "inappropriate_content",
      "spam",
      "illegal_item",
      "offensive_language",
      "other",
    ],
    required: true,
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "reviewing", "resolved", "dismissed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
