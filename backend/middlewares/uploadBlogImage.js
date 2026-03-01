import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// Constants for better maintainability
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Check if Cloudinary is properly configured
export const isCloudinaryAvailable =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// If Cloudinary is not configured, log warning (only once)
if (!isCloudinaryAvailable && process.env.NODE_ENV !== "production") {
  console.warn(
    "[WARNING] Cloudinary is not configured. Image uploads will fail. " +
    "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
  );
}

// Use memory storage (buffer) → perfect for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Check mime type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const error = new Error(
        `Invalid file type. Allowed: JPEG, PNG, WebP, GIF`
      );
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }

    // Optional: extra check for file extension (some clients lie about mime)
    const ext = file.originalname.split(".").pop().toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!validExts.includes(ext)) {
      const error = new Error("Invalid file extension");
      error.code = "INVALID_FILE_EXTENSION";
      return cb(error, false);
    }

    cb(null, true);
  },
});

// Optional: Global error handler for multer
upload.onError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  next(err);
};

export default upload;