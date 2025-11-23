import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import {
  GetAllUser,
  CreateUser,
  getInforUserById,
  LoginUser,
  UpdateUserAvatar,
} from "../controller/user.controller.js";
import {
  CreateProduct,
  GetALLProduct,
  GetProductById,
  DeleteProduct,
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
} from "../controller/payment.controller.js";

const router = express.Router();

const api_routes = (app) => {
  // Public routes
  router.get("/products", GetALLProduct);
  router.get("/products/:id", GetProductById);
  router.get("/categories", GetCategories);
  router.post("/create-user", CreateUser);
  router.post("/login", LoginUser);

  // Protected routes (require authentication)
  router.get("/get-users", verifyToken, GetAllUser);
  router.get("/user/:id", verifyToken, getInforUserById);
  router.patch("/user/:id/avatar", verifyToken, UpdateUserAvatar);

  // Admin only routes
  router.delete("/categories/:id", verifyToken, isAdmin, DeleteCategory);
  router.post("/categories", verifyToken, isAdmin, CreateCategory);
  router.delete("/products/:id", verifyToken, isAdmin, DeleteProduct);

  // Protected routes (require authentication but not admin)
  router.post("/products", verifyToken, CreateProduct);

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

  app.use("/api", router);
};

export default api_routes;
