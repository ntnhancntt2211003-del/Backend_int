import mongoose from "mongoose";

const ImagesProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  // main/cover image GridFS file ID (optional - can be null if no main image)
  mainImageFileId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  // up to 3 additional image GridFS file IDs
  additionalImageFileIds: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 3;
      },
      message: "additionalImageFileIds can contain at most 3 images",
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one image document per product (optional, enforces one-to-one)
ImagesProductSchema.index({ productId: 1 }, { unique: true });

const ImageProduct = mongoose.model("ImageProduct", ImagesProductSchema);

export default ImageProduct;
