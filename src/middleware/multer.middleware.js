import multer from "multer";
import path from "path";
import { v4 } from "uuid";

export const fileUploadMiddleware = (fieldName, dir = "uploads") => {
  return multer({
    storage: multer.diskStorage({
      destination: "public/" + dir, // lưu trữ file vào public/<dir>
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, v4() + extension);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 20, // 20MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG and PNG images are allowed."), false);
      }
    },
  }).single(fieldName);
};

export const FileUploadFields = (fields, dir) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === "image") {
          cb(null, "public/images/products");
        } else if (file.fieldname === "images") {
          cb(null, "public/images/products/ImagesProductMore");
        } else if (dir) {
          cb(null, "public/" + dir);
        } else {
          cb(null, "public/images");
        }
      },
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, v4() + extension);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 20, // 20MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only JPEG and PNG images are allowed."), false);
      }
    },
  }).fields(fields);
};
