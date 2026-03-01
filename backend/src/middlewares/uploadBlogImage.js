import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// Constants for easy configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];

// Check if Cloudinary config is complete
export const isCloudinaryAvailable =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// ────────────────────────────────────────────────
//  Cloudinary Storage (preferred when configured)
// ────────────────────────────────────────────────
let storage;

if (isCloudinaryAvailable) {
  try {
    // ✅ FIX: Correct ESM import
    const pkg = await import("multer-storage-cloudinary");
    const { CloudinaryStorage } = pkg.default || pkg;

    storage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: "blogs",
        allowed_formats: ALLOWED_FORMATS,
      }),
    });

    console.log("Cloudinary storage initialized successfully");
  } catch (err) {
    console.error("Failed to initialize Cloudinary storage:", err.message);
    storage = multer.memoryStorage(); // fallback
  }
} else {
  console.warn(
    "Cloudinary not configured → falling back to memory storage. " +
    "Set CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET in .env"
  );
  storage = multer.memoryStorage();
}

// ────────────────────────────────────────────────
//  Multer instance with validation
// ────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isAllowedFormat = ALLOWED_FORMATS.some((fmt) =>
      file.mimetype.includes(fmt)
    );

    if (!isImage || !isAllowedFormat) {
      const error = new Error(
        `Only ${ALLOWED_FORMATS.join(", ").toUpperCase()} images allowed`
      );
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }

    cb(null, true);
  },
});

// Optional: Better error response helper (use in routes if needed)
upload.onError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `File too large. Max size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Invalid file upload",
    });
  }
  next(err);
};

export default upload;