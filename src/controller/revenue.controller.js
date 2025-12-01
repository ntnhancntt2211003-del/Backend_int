import Product from "../models/products.js";
import Ad from "../models/ad.js";
import PaymentTransaction from "../models/paymentTransaction.js";

/**
 * GET /api/dashboard/revenue/posting
 * Tính doanh thu từ phí đăng tin (từ PaymentTransaction success)
 */
export const GetPostingFeeRevenue = async (req, res) => {
  try {
    // Tính tổng amount từ tất cả successful payment transactions có product
    const result = await PaymentTransaction.aggregate([
      {
        $match: {
          status: "success", // Chỉ lấy payment đã thành công
          productId: { $ne: null }, // Phải có productId mới tính doanh thu
        },
      },
      {
        $group: {
          _id: null,
          totalPostingFeeRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const postingFeeRevenue = result[0]?.totalPostingFeeRevenue || 0;
    const totalTransactions = result[0]?.totalTransactions || 0;

    res.status(200).json({
      success: true,
      data: {
        type: "posting_fee",
        revenue: postingFeeRevenue,
        totalTransactions,
        currency: "VND",
      },
    });
  } catch (error) {
    console.error("Error calculating posting fee revenue:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error calculating posting fee revenue",
    });
  }
};

/**
 * GET /api/dashboard/revenue/ads
 * Tính doanh thu từ quảng cáo
 */
export const GetAdsRevenue = async (req, res) => {
  try {
    // Tính tổng price từ tất cả ads
    const result = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 }, // Chỉ lấy ads có giá > 0
        },
      },
      {
        $group: {
          _id: null,
          totalAdsRevenue: { $sum: "$price" },
          totalAds: { $sum: 1 },
        },
      },
    ]);

    const adsRevenue = result[0]?.totalAdsRevenue || 0;
    const totalAds = result[0]?.totalAds || 0;

    res.status(200).json({
      success: true,
      data: {
        type: "ads",
        revenue: adsRevenue,
        totalAds,
        currency: "VND",
      },
    });
  } catch (error) {
    console.error("Error calculating ads revenue:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error calculating ads revenue",
    });
  }
};

/**
 * GET /api/dashboard/revenue
 * Tính doanh thu tổng hợp (posting fee + ads)
 */
export const GetTotalRevenue = async (req, res) => {
  try {
    // Lấy doanh thu đăng tin từ PaymentTransaction success có product
    const postingResult = await PaymentTransaction.aggregate([
      {
        $match: {
          status: "success",
          productId: { $ne: null }, // Phải có productId mới tính doanh thu
        },
      },
      {
        $group: {
          _id: null,
          totalPostingFeeRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const postingFeeRevenue = postingResult[0]?.totalPostingFeeRevenue || 0;
    const totalTransactions = postingResult[0]?.totalTransactions || 0;

    // Lấy doanh thu quảng cáo từ Ad price
    const adsResult = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalAdsRevenue: { $sum: "$price" },
          totalAds: { $sum: 1 },
        },
      },
    ]);

    const adsRevenue = adsResult[0]?.totalAdsRevenue || 0;
    const totalAds = adsResult[0]?.totalAds || 0;

    const totalRevenue = postingFeeRevenue + adsRevenue;

    res.status(200).json({
      success: true,
      data: {
        postingFee: {
          revenue: postingFeeRevenue,
          totalTransactions,
        },
        ads: {
          revenue: adsRevenue,
          totalAds,
        },
        total: totalRevenue,
        currency: "VND",
      },
    });
  } catch (error) {
    console.error("Error calculating total revenue:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error calculating total revenue",
    });
  }
};

/**
 * GET /api/dashboard/revenue/breakdown
 * Breakdown chi tiết doanh thu
 */
export const GetRevenueBreakdown = async (req, res) => {
  try {
    // Doanh thu phí đăng tin từ PaymentTransaction success có product
    const postingResult = await PaymentTransaction.aggregate([
      {
        $match: {
          status: "success",
          productId: { $ne: null }, // Phải có productId mới tính doanh thu
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
          minFee: { $min: "$amount" },
          maxFee: { $max: "$amount" },
          avgFee: { $avg: "$amount" },
        },
      },
    ]);

    // Doanh thu quảng cáo
    const adsResult = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$price" },
          count: { $sum: 1 },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
    ]);

    const postingData = postingResult[0] || {
      revenue: 0,
      count: 0,
      minFee: 0,
      maxFee: 0,
      avgFee: 0,
    };

    const adsData = adsResult[0] || {
      revenue: 0,
      count: 0,
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        postingFee: {
          revenue: postingData.revenue,
          count: postingData.count,
          minFee: postingData.minFee,
          maxFee: postingData.maxFee,
          avgFee: Math.round(postingData.avgFee),
        },
        ads: {
          revenue: adsData.revenue,
          count: adsData.count,
          minPrice: adsData.minPrice,
          maxPrice: adsData.maxPrice,
          avgPrice: Math.round(adsData.avgPrice),
        },
        totalRevenue: postingData.revenue + adsData.revenue,
        currency: "VND",
      },
    });
  } catch (error) {
    console.error("Error calculating revenue breakdown:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error calculating revenue breakdown",
    });
  }
};

/**
 * GET /api/dashboard/revenue/postings/details
 * Chi tiết doanh thu từng sản phẩm được thanh toán
 */
export const GetPostingRevenueDetails = async (req, res) => {
  try {
    const details = await PaymentTransaction.aggregate([
      {
        $match: {
          status: "success",
          productId: { $ne: null }, // Chỉ lấy payment có product
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "product.IdOnwer",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          amount: 1,
          status: 1,
          paidAt: 1,
          createdAt: 1,
          productName: "$product.name",
          productPrice: "$product.price",
          productCondition: "$product.condition",
          productAddress: "$product.address",
          ownerName: "$owner.username",
          ownerEmail: "$owner.email",
          ownerPhone: "$owner.numberPhone",
        },
      },
      {
        $sort: { paidAt: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: details,
      message: "Chi tiết doanh thu đăng tin",
    });
  } catch (error) {
    console.error("Error getting posting revenue details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error getting posting revenue details",
    });
  }
};

/**
 * GET /api/dashboard/revenue/ads/details
 * Chi tiết doanh thu từng quảng cáo
 */
export const GetAdsRevenueDetails = async (req, res) => {
  try {
    const details = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          caption: 1,
          price: 1,
          isActive: 1,
          createdAt: 1,
          creatorName: "$creator.username",
          creatorEmail: "$creator.email",
          creatorPhone: "$creator.numberPhone",
          imageUrl: 1,
          videoUrl: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: details,
      message: "Chi tiết doanh thu quảng cáo",
    });
  } catch (error) {
    console.error("Error getting ads revenue details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error getting ads revenue details",
    });
  }
};
