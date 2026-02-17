import express from "express";
import upload, { isCloudinaryAvailable } from "../middlewares/uploadBlogImage.js";

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // If Cloudinary is not available, memoryStorage cannot provide a public URL.
    // So we must stop here to avoid saving broken imageUrl into MongoDB.
    if (!isCloudinaryAvailable) {
      return res.status(500).json({
        message:
          "Image upload is not configured on server. Please set Cloudinary environment variables in Render.",
      });
    }

    // Cloudinary gives a hosted URL. Depending on storage version it can be:
    // - req.file.path
    // - req.file.url
    // - req.file.secure_url
    const imageUrl =
      req.file.path || req.file.url || req.file.secure_url || null;

    if (!imageUrl) {
      return res.status(500).json({
        message: "Upload succeeded but image URL was not returned by Cloudinary.",
      });
    }

    return res.status(200).json({
      imageUrl,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
});

export default router;
