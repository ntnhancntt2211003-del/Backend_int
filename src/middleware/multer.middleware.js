import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Multer for Ads (supports image and video)
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "../../public/uploads/ads");
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      const name = path.basename(file.originalname, extension);
      cb(null, `${name}-${Date.now()}${extension}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for video support
  },
  fileFilter: (req, file, cb) => {
    const allowedImageMimes = ["image/png", "image/jpg", "image/jpeg"];
    const allowedVideoMimes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
    ];
    const allAllowedMimes = [...allowedImageMimes, ...allowedVideoMimes];

    if (allAllowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPEG, PNG images and MP4, MOV, AVI videos are allowed."
        ),
        false
      );
    }
  },
});
