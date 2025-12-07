import mongoose from "mongoose";

const PaymentTransactionSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentType: {
    type: String,
    enum: ["posting_fee", "ads", "other"],
    default: "posting_fee",
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    default: "momo",
  },
  transactionId: {
    type: String,
    default: "",
  },
  momoResponse: {
    type: Object,
    default: {},
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    },
  },
  paidAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index để tự động xóa transaction hết hạn
PaymentTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PaymentTransaction = mongoose.model(
  "PaymentTransaction",
  PaymentTransactionSchema
);

export default PaymentTransaction;
