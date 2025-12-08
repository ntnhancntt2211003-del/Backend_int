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
    console.log(`📊 updatePaymentStatus called:`, {
      orderId,
      status,
      transactionId,
    });

    const updateData = {
      status: status,
    };

    if (status === "success") {
      updateData.paidAt = new Date();
      if (transactionId) {
        updateData.transactionId = transactionId;
      }
      console.log(
        `✅ Setting status to SUCCESS with paidAt:`,
        updateData.paidAt
      );
    }

    if (momoData) {
      updateData.momoResponse = momoData;
    }

    const transaction = await PaymentTransaction.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    console.log(`📝 Transaction after update:`, {
      orderId: transaction?.orderId,
      status: transaction?.status,
      paidAt: transaction?.paidAt,
      productId: transaction?.productId,
      hasProductId: !!transaction?.productId,
    });

    // If payment is success and has productId, save posting fee to product history
    if (status === "success" && transaction?.productId) {
      console.log(
        `💾 Status is success and productId exists (${transaction.productId}), saving fee...`
      );
      const postingFee = await getPostingFee();
      const updateResult = await Product.findByIdAndUpdate(
        transaction.productId,
        {
          postingFee: postingFee.amount,
          $push: {
            postingFeeHistory: {
              amount: postingFee.amount,
              paidAt: new Date(),
              orderId: orderId,
              transactionId: transactionId || transaction.transactionId,
            },
          },
        },
        { new: true }
      );

      console.log(`✅ Fee saved in updatePaymentStatus:`, {
        productId: updateResult._id,
        feeHistoryCount: updateResult.postingFeeHistory?.length || 0,
      });
    } else {
      console.log(`⚠️ Not saving fee in updatePaymentStatus:`, {
        statusIsSuccess: status === "success",
        hasProductId: !!transaction?.productId,
      });
    }

    return transaction;
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    throw new Error("Error updating payment status: " + error.message);
  }
};

export const linkProductToPayment = async (orderId, productId) => {
  try {
    console.log(
      `🔍 linkProductToPayment service: Looking for transaction ${orderId} with status="success"`
    );

    const transaction = await PaymentTransaction.findOneAndUpdate(
      { orderId, status: "success" },
      { productId },
      { new: true }
    );

    console.log(`📊 linkProductToPayment service: Query result:`, {
      found: !!transaction,
      status: transaction?.status,
      productIdBefore: transaction?.productId,
    });

    // If transaction is success and has productId, save posting fee to product history
    if (
      transaction &&
      transaction.status === "success" &&
      transaction.productId
    ) {
      console.log(
        `💾 Saving postingFeeHistory to product ${transaction.productId}...`
      );
      const postingFee = await getPostingFee();

      const updateResult = await Product.findByIdAndUpdate(
        transaction.productId,
        {
          postingFee: postingFee.amount,
          $push: {
            postingFeeHistory: {
              amount: postingFee.amount,
              paidAt: transaction.paidAt || new Date(),
              orderId: orderId,
              transactionId: transaction.transactionId,
            },
          },
        },
        { new: true }
      );

      console.log(`✅ postingFeeHistory saved. Updated product:`, {
        productId: updateResult._id,
        postingFee: updateResult.postingFee,
        feeHistoryCount: updateResult.postingFeeHistory?.length || 0,
        lastFee:
          updateResult.postingFeeHistory?.[
            updateResult.postingFeeHistory.length - 1
          ],
      });
    } else {
      console.warn(`⚠️ Not saving fee - transaction conditions not met:`, {
        transactionFound: !!transaction,
        isSuccess: transaction?.status === "success",
        hasProductId: !!transaction?.productId,
      });
    }

    return transaction;
  } catch (error) {
    console.error("❌ Error linking product to payment:", error);
    throw new Error("Error linking product to payment: " + error.message);
  }
};
