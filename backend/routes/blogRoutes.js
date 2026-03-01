import express from "express";
import upload from "../middlewares/uploadBlogImage.js";

const router = express.Router();

// Optional: You can add these limits in your multer config too
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Optional: extra validation (multer already checks some, but good to double-check)
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        message: "File too large. Maximum allowed size is 5MB",
      });
    }

    // Optional: check mime type (multer may already filter, but extra safety)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(415).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, WebP, GIF allowed",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: req.file.path,          // Cloudinary/public path
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

  } catch (err) {
    console.error("Blog image upload error:", err);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;