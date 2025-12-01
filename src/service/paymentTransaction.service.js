import PaymentTransaction from "../models/paymentTransaction.js";
import { createMoMoPayment } from "./momoPayment.service.js";
import { getPostingFee } from "./postingFee.service.js";
import Product from "../models/products.js";

export const createPaymentForPosting = async () => {
  try {
    // Get current posting fee
    const postingFee = await getPostingFee();

    // Generate unique order ID
    const orderId = `POST_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create transaction record
    const transaction = new PaymentTransaction({
      orderId,
      amount: postingFee.amount,
      status: "pending",
    });

    await transaction.save();

    // Create MoMo payment
    const orderInfo = `Thanh toán phí đăng tin - ${postingFee.name}`;
    const momoResult = await createMoMoPayment(
      orderId,
      postingFee.amount,
      orderInfo
    );

    if (!momoResult.success) {
      // Update transaction as failed
      transaction.status = "failed";
      transaction.momoResponse = momoResult;
      await transaction.save();

      throw new Error(momoResult.message);
    }

    // Update transaction with MoMo response
    transaction.momoResponse = momoResult.data;
    await transaction.save();

    return {
      success: true,
      transaction,
      paymentUrl: momoResult.payUrl,
      orderId,
      amount: postingFee.amount,
    };
  } catch (error) {
    console.error("Create payment transaction error:", error);
    throw new Error("Error creating payment: " + error.message);
  }
};

export const getPaymentByOrderId = async (orderId) => {
  try {
    const transaction = await PaymentTransaction.findOne({ orderId });
    return transaction;
  } catch (error) {
    throw new Error("Error fetching transaction: " + error.message);
  }
};

export const updatePaymentStatus = async (
  orderId,
  status,
  transactionId = null,
  momoData = null
) => {
  try {
    const updateData = {
      status: status,
    };

    if (status === "success") {
      updateData.paidAt = new Date();
      if (transactionId) {
        updateData.transactionId = transactionId;
      }
    }

    if (momoData) {
      updateData.momoResponse = momoData;
    }

    const transaction = await PaymentTransaction.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    // If payment is success and has productId, update Product with postingFee
    if (status === "success" && transaction?.productId) {
      const postingFee = await getPostingFee();
      await Product.findByIdAndUpdate(
        transaction.productId,
        { postingFee: postingFee.amount },
        { new: true }
      );
    }

    return transaction;
  } catch (error) {
    throw new Error("Error updating payment status: " + error.message);
  }
};

export const linkProductToPayment = async (orderId, productId) => {
  try {
    const transaction = await PaymentTransaction.findOneAndUpdate(
      { orderId, status: "success" },
      { productId },
      { new: true }
    );

    return transaction;
  } catch (error) {
    throw new Error("Error linking product to payment: " + error.message);
  }
};
