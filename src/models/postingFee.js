import mongoose from "mongoose";

const PostingFeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Phí đăng tin",
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    default: 10000, // 10,000 VND mặc định
  },
  description: {
    type: String,
    default: "Phí đăng tin sản phẩm",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

PostingFeeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const PostingFee = mongoose.model("PostingFee", PostingFeeSchema);

export default PostingFee;
