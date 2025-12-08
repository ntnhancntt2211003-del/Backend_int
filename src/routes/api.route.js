import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import {
  GetAllUser,
  CreateUser,
  getInforUserById,
  getSellerProfilePublic,
  LoginUser,
  UpdateUserAvatar,
  UpdateUser,
  ChangePassword,
  ForgotPassword,
  ResetPassword,
  GetSellersWithProducts,
} from "../controller/user.controller.js";
import {
  CreateProduct,
  GetALLProduct,
  GetProductById,
  DeleteProduct,
  UpdateProduct,
} from "../controller/products.contoller.js";
import {
  GetCategories,
  CreateCategory,
  DeleteCategory,
} from "../controller/categories.controller.js";
import {
  GetImagesByProduct,
  GetAllImages,
  UpsertImagesJson,
  uploadMiddleware,
  UpsertImagesUpload,
  ServeGridFSFile,
  DeleteImages,
} from "../controller/image.controller.js";
import {
  GetPostingFee,
  UpdatePostingFee,
} from "../controller/postingFee.controller.js";
import {
  CreatePaymentForPosting,
  GetPaymentStatus,
  HandleMoMoIPN,
  HandlePaymentReturn,
  LinkProductToPayment,
  ConfirmPaymentCompletion,
  GetPaymentTransactions,
} from "../controller/payment.controller.js";
import {
  CreateReport,
  GetReports,
  UpdateReportStatus,
} from "../controller/report.controller.js";
import {
  CreateComment,
  GetComments,
  DeleteComment,
  UpdateComment,
} from "../controller/comment.controller.js";
import {
  CreateAd,
  GetAds,
  GetAllAds,
  GetAdById,
  UpdateAd,
  DeleteAd,
} from "../controller/ad.controller.js";
import {
  GetPostingFeeRevenue,
  GetAdsRevenue,
  GetTotalRevenue,
  GetRevenueBreakdown,
  GetPostingRevenueDetails,
  GetAdsRevenueDetails,
} from "../controller/revenue.controller.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  removeFollower,
} from "../controller/follow.controller.js";
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from "../controller/message.controller.js";
import { sendContactMessage } from "../controller/contact.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

const api_routes = (app) => {
  // Public routes
  router.get("/products", GetALLProduct);
  router.get("/products/:id", GetProductById);
  router.get("/categories", GetCategories);
  router.get("/users/:id/profile", getSellerProfilePublic);
  router.get("/sellers-with-products", GetSellersWithProducts);
  router.post("/create-user", CreateUser);
  router.post("/login", LoginUser);
  router.post("/forgot-password", ForgotPassword);
  router.post("/reset-password/:token", ResetPassword);

  // Protected routes (require authentication)
  router.get("/get-users", verifyToken, GetAllUser);
  router.get("/user/:id", verifyToken, getInforUserById);
  router.patch("/user/:id/avatar", verifyToken, UpdateUserAvatar);
  router.patch("/user/:id", verifyToken, UpdateUser);
  router.post("/user/:id/change-password", verifyToken, ChangePassword);

  // Admin only routes
  router.delete("/categories/:id", verifyToken, isAdmin, DeleteCategory);
  router.post("/categories", verifyToken, isAdmin, CreateCategory);
  router.delete("/products/:id", verifyToken, isAdmin, DeleteProduct);

  // Protected routes (require authentication but not admin)
  router.post("/products", verifyToken, CreateProduct);
  router.patch("/products/:id", verifyToken, UpdateProduct);

  // Images - Updated to use 'id' parameter and GridFS
  router.get("/images", GetAllImages);
  router.get("/images/:id", GetImagesByProduct);
  router.post("/images/:id", verifyToken, isAdmin, UpsertImagesJson);
  router.post(
    "/images/:id/upload",
    verifyToken,
    uploadMiddleware,
    UpsertImagesUpload
  );
  router.delete("/images/:id", verifyToken, isAdmin, DeleteImages);
  // Serve GridFS files
  router.get("/images/file/:fileId", ServeGridFSFile);

  // Posting Fee (Admin)
  router.get("/posting-fee", GetPostingFee);
  router.put("/posting-fee", verifyToken, isAdmin, UpdatePostingFee);

  // Payment
  router.post("/payment/create", verifyToken, CreatePaymentForPosting);
  router.get("/payment/status/:orderId", GetPaymentStatus);
  router.post("/payment/confirm", verifyToken, ConfirmPaymentCompletion);
  router.post("/payment/momo/ipn", HandleMoMoIPN);
  router.get("/payment/momo/return", HandlePaymentReturn);
  router.post("/payment/link-product", verifyToken, LinkProductToPayment);
  router.get(
    "/paymentTransaction",
    verifyToken,
    isAdmin,
    GetPaymentTransactions
  );

  // Reports
  router.post("/reports", verifyToken, CreateReport);
  router.get("/reports", verifyToken, isAdmin, GetReports);
  router.patch("/reports/:id/status", verifyToken, isAdmin, UpdateReportStatus);

  // Comments
  router.get("/comments", GetComments);
  router.post("/comments", verifyToken, CreateComment);
  router.patch("/comments/:id", verifyToken, UpdateComment);
  router.delete("/comments/:id", verifyToken, DeleteComment);

  // Follow routes
  router.post("/users/:userId/follow", verifyToken, followUser);
  router.post("/users/:userId/unfollow", verifyToken, unfollowUser);
  router.delete("/users/:userId/remove-follower", verifyToken, removeFollower);
  router.get("/users/:userId/followers", getFollowers);
  router.get("/users/:userId/following", getFollowing);
  router.get("/users/:userId/is-following", verifyToken, isFollowing);

  // Ads
  router.post(
    "/ads",
    verifyToken,
    upload.fields([
      { name: "image", maxCount: 1 },
      { name: "video", maxCount: 1 },
    ]),
    CreateAd
  );
  router.get("/ads", GetAds);
  router.get("/ads/admin/all", verifyToken, GetAllAds);
  router.get("/ads/:id", GetAdById);
  router.patch("/ads/:id", verifyToken, UpdateAd);
  router.delete("/ads/:id", verifyToken, DeleteAd);

  // Revenue Dashboard
  router.get("/dashboard/revenue", GetTotalRevenue);
  router.get("/dashboard/revenue/posting", GetPostingFeeRevenue);
  router.get("/dashboard/revenue/ads", GetAdsRevenue);
  router.get("/dashboard/revenue/breakdown", GetRevenueBreakdown);
  router.get("/dashboard/revenue/postings/details", GetPostingRevenueDetails);
  router.get("/dashboard/revenue/ads/details", GetAdsRevenueDetails);

  // Messaging
  router.post("/messages/send", verifyToken, sendMessage);
  router.get("/messages/conversations", verifyToken, getConversations);
  router.get("/messages/:otherUserId", verifyToken, getConversation);
  router.patch("/messages/:messageId/read", verifyToken, markAsRead);
  router.delete("/messages/:messageId", verifyToken, deleteMessage);
  router.get("/messages/unread/count", verifyToken, getUnreadCount);

  // Contact
  router.post("/contact/send", sendContactMessage);

  app.use("/api", router);
};

export default api_routes;
