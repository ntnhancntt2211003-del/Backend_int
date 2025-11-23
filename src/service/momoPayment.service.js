import crypto from "crypto";
import axios from "axios";

// MoMo Configuration
const MOMO_CONFIG = {
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  redirectUrl:
    process.env.MOMO_REDIRECT_URL || "http://localhost:3000/payment/success",
  ipnUrl:
    process.env.MOMO_IPN_URL || "http://localhost:8080/api/payment/momo/ipn",
  requestType: "payWithMethod",
  extraData: "",
  lang: "vi",
  endpoint:
    process.env.MOMO_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
};

export const createMoMoPayment = async (
  orderId,
  amount,
  orderInfo = "Thanh toán phí đăng tin"
) => {
  try {
    const requestId = orderId;

    // Don't include query parameters in redirect URL - MoMo will append them
    const redirectUrl =
      process.env.MOMO_REDIRECT_URL || "http://localhost:3000/users/post-ad";

    // Tạo raw signature
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${MOMO_CONFIG.extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${MOMO_CONFIG.requestType}`;

    // Tạo signature
    const signature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    // Request body
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: "ChợTốt Clone",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      lang: MOMO_CONFIG.lang,
      requestType: MOMO_CONFIG.requestType,
      autoCapture: true,
      extraData: MOMO_CONFIG.extraData,
      signature: signature,
    };

    console.log("MoMo Request:", requestBody);

    // Gửi request tới MoMo
    const response = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("MoMo Response:", response.data);

    return {
      success: response.data.resultCode === 0,
      data: response.data,
      payUrl: response.data.payUrl,
      message: response.data.message || "Tạo thanh toán thành công",
    };
  } catch (error) {
    console.error("MoMo Payment Error:", error);
    return {
      success: false,
      message: "Lỗi khi tạo thanh toán MoMo: " + error.message,
      error: error.response?.data || error.message,
    };
  }
};

export const verifyMoMoIPN = (body) => {
  try {
    const {
      accessKey,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      signature,
      transId,
    } = body;

    // Tạo raw signature để verify
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    // Tạo signature để so sánh
    const expectedSignature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    return {
      isValid: signature === expectedSignature,
      isPaid: resultCode === 0,
      orderId,
      transId,
      amount,
      message,
    };
  } catch (error) {
    console.error("MoMo IPN Verification Error:", error);
    return {
      isValid: false,
      isPaid: false,
      error: error.message,
    };
  }
};
