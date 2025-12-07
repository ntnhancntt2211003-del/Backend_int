import Product from "../models/products.js";
import Ad from "../models/ad.js";
import PaymentTransaction from "../models/paymentTransaction.js";

/**
 * GET /api/dashboard/revenue/posting
 * Tính doanh thu từ phí đăng tin (từ lịch sử phí trong product)
 */
export const GetPostingFeeRevenue = async (req, res) => {
  try {
    // Tính tổng phí đăng tin từ lịch sử trong products
    const result = await Product.aggregate([
      {
        $unwind: {
          path: "$postingFeeHistory",
          preserveNullAndEmptyArrays: false, // Chỉ lấy product có lịch sử phí
        },
      },
      {
        $group: {
          _id: null,
          totalPostingFeeRevenue: { $sum: "$postingFeeHistory.amount" },
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
    // Tính tổng price từ quảng cáo đang hoạt động
    const result = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 }, // Chỉ lấy ads có giá > 0
          isActive: true, // Chỉ tính QC đang hoạt động
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
    // Lấy doanh thu đăng tin từ lịch sử phí trong products
    const postingResult = await Product.aggregate([
      {
        $unwind: {
          path: "$postingFeeHistory",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: null,
          totalPostingFeeRevenue: { $sum: "$postingFeeHistory.amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    const postingFeeRevenue = postingResult[0]?.totalPostingFeeRevenue || 0;
    const totalTransactions = postingResult[0]?.totalTransactions || 0;

    // Lấy doanh thu quảng cáo từ Ad price (chỉ QC đang hoạt động)
    const adsResult = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 },
          isActive: true, // Chỉ tính QC đang hoạt động
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
    // Doanh thu phí đăng tin từ lịch sử phí trong products
    const postingResult = await Product.aggregate([
      {
        $unwind: {
          path: "$postingFeeHistory",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$postingFeeHistory.amount" },
          count: { $sum: 1 },
          minFee: { $min: "$postingFeeHistory.amount" },
          maxFee: { $max: "$postingFeeHistory.amount" },
          avgFee: { $avg: "$postingFeeHistory.amount" },
        },
      },
    ]);

    // Doanh thu quảng cáo - giá quảng cáo (price) là doanh thu từ QC
    const adsResult = await Ad.aggregate([
      {
        $match: {
          price: { $ne: null, $gt: 0 }, // Chỉ lấy QC có giá > 0
          isActive: true, // Chỉ tính QC đang hoạt động
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
 * Chi tiết doanh thu từng sản phẩm từ lịch sử phí
 */
export const GetPostingRevenueDetails = async (req, res) => {
  try {
    const details = await Product.aggregate([
      {
        $match: {
          postingFeeHistory: { $exists: true, $ne: [] }, // Chỉ lấy product có lịch sử phí
        },
      },
      {
        $unwind: {
          path: "$postingFeeHistory",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "IdOnwer",
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
          productName: "$name",
          productPrice: "$price",
          productCondition: "$condition",
          productAddress: "$address",
          fee: "$postingFeeHistory.amount",
          feeOrderId: "$postingFeeHistory.orderId",
          feeTransactionId: "$postingFeeHistory.transactionId",
          feePaidAt: "$postingFeeHistory.paidAt",
          createdAt: "$createdAt",
          ownerName: "$owner.username",
          ownerEmail: "$owner.email",
          ownerPhone: "$owner.numberPhone",
        },
      },
      {
        $sort: { feePaidAt: -1 },
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
          isActive: true, // Chỉ lấy QC đang hoạt động
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
