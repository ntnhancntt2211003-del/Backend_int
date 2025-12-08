import {
  createPaymentForPosting,
  getPaymentByOrderId,
  updatePaymentStatus,
  linkProductToPayment,
} from "../service/paymentTransaction.service.js";
import { verifyMoMoIPN } from "../service/momoPayment.service.js";
import PaymentTransaction from "../models/paymentTransaction.js";

export const GetPaymentTransactions = async (req, res) => {
  try {
    const transactions = await PaymentTransaction.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: transactions,
      message: "Lấy danh sách giao dịch thành công",
    });
  } catch (error) {
    console.error("GetPaymentTransactions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const CreatePaymentForPosting = async (req, res) => {
  try {
    const result = await createPaymentForPosting();

    return res.status(201).json({
      success: true,
      data: {
        orderId: result.orderId,
        paymentUrl: result.paymentUrl,
        amount: result.amount,
      },
      message: "Tạo thanh toán thành công",
    });
  } catch (error) {
    console.error("CreatePaymentForPosting error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const transaction = await getPaymentByOrderId(orderId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: transaction.orderId,
        status: transaction.status,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        paidAt: transaction.paidAt,
      },
    });
  } catch (error) {
    console.error("GetPaymentStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const HandleMoMoIPN = async (req, res) => {
  try {
    console.log("🔔 MoMo IPN received:", req.body);

    const verification = verifyMoMoIPN(req.body);

    if (!verification.isValid) {
      console.error("❌ Invalid MoMo IPN signature");
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const { orderId, transId, isPaid } = verification;

    // Update payment status
    const status = isPaid ? "success" : "failed";
    console.log(`📝 Updating payment status: ${orderId} → ${status}`);

    const transaction = await updatePaymentStatus(
      orderId,
      status,
      transId,
      req.body
    );

    if (!transaction) {
      console.error("❌ Transaction not found:", orderId);
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    console.log(`✅ Payment ${orderId} updated to ${status}`);

    return res.status(200).json({
      success: true,
      message: "IPN processed successfully",
    });
  } catch (error) {
    console.error("❌ HandleMoMoIPN error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const HandlePaymentReturn = async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.query;

    if (!orderId) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/payment/error?message=Missing orderId`
      );
    }

    const transaction = await getPaymentByOrderId(orderId);

    if (!transaction) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/payment/error?message=Transaction not found`
      );
    }

    if (resultCode === "0") {
      await updatePaymentStatus(orderId, "success");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/payment/success?orderId=${orderId}`
      );
    } else {
      await updatePaymentStatus(orderId, "failed");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/payment/error?message=${encodeURIComponent(
          message || "Payment failed"
        )}`
      );
    }
  } catch (error) {
    console.error("HandlePaymentReturn error:", error);
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/payment/error?message=System error`
    );
  }
};

export const LinkProductToPayment = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    console.log("🔗 LinkProductToPayment called:", { orderId, productId });

    if (!orderId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin orderId hoặc productId",
      });
    }

    console.log(`📝 Linking product ${productId} to payment ${orderId}...`);
    const transaction = await linkProductToPayment(orderId, productId);

    if (!transaction) {
      console.error(`❌ Transaction not found or not paid: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giao dịch hoặc chưa thanh toán",
      });
    }

    console.log(`✅ Product linked successfully. Transaction:`, {
      orderId: transaction.orderId,
      status: transaction.status,
      productId: transaction.productId,
      paidAt: transaction.paidAt,
    });

    return res.status(200).json({
      success: true,
      data: transaction,
      message: "Liên kết sản phẩm thành công",
    });
  } catch (error) {
    console.error("❌ LinkProductToPayment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// New endpoint for frontend to confirm payment completion
export const ConfirmPaymentCompletion = async (req, res) => {
  try {
    const { orderId, resultCode, productId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderId",
      });
    }

    // Get transaction
    const transaction = await getPaymentByOrderId(orderId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update status based on resultCode
    let newStatus = "pending";
    if (resultCode === "0") {
      newStatus = "success";
    } else {
      newStatus = "failed";
    }

    const updatedTransaction = await updatePaymentStatus(
      orderId,
      newStatus,
      null,
      { resultCode }
    );

    // If payment success and productId provided, link product
    if (newStatus === "success" && productId) {
      await linkProductToPayment(orderId, productId);
    }

    console.log(`✅ Payment ${orderId} confirmed as ${newStatus}`);

    return res.status(200).json({
      success: true,
      data: updatedTransaction,
      message: `Payment status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("ConfirmPaymentCompletion error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
