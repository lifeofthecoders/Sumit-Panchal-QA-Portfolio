import express from "express";
import Blog from "../models/Blog.js";
import upload, { isCloudinaryAvailable } from "../middlewares/uploadBlogImage.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Simple test endpoint to verify POST works on deployed server
router.post('/upload-test', (req, res) => {
  return res.status(200).json({ ok: true, message: 'upload-test endpoint reached' });
});

// Temporary alternative upload endpoint that accepts a base64 image payload in JSON.
// This bypasses multer/multipart handling and can help diagnose whether multipart uploads
// are causing the crash on the Render instance. Expects { imageBase64: 'data:image/png;base64,...' }
router.post('/upload-base64', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'No imageBase64 provided' });
    // Ensure Cloudinary SDK is available and configured
    if (!cloudinary || !cloudinary.uploader) {
      console.error('upload-base64 attempted but Cloudinary uploader is not available');
      return res.status(503).json({ message: 'Cloudinary is not configured on the server' });
    }

    // Upload directly to Cloudinary using the SDK
    const result = await cloudinary.uploader.upload(imageBase64, { folder: 'blogs' });
    if (!result || !result.secure_url) {
      return res.status(500).json({ message: 'Cloudinary did not return a secure_url', raw: result });
    }

    return res.status(200).json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error('upload-base64 error:', err);
    return res.status(500).json({ message: 'Upload failed', error: err.message || String(err) });
  }
});

/**
 * GET /api/blogs
 * Returns all blogs, latest first
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    // ✅ Total blog count
    const totalBlogs = await Blog.countDocuments();

    // ✅ Latest first
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: blogs,
      pagination: {
        totalBlogs: totalBlogs, // ✅ IMPORTANT (frontend needs this)
        page,
        limit,
        totalPages: Math.ceil(totalBlogs / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/blogs error:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

/**
 * ✅ POST /api/blogs/upload
 * Upload image to Cloudinary
 * IMPORTANT: This MUST be above "/:id" route
 * Implementation: call multer upload programmatically so we can catch middleware errors
 */
router.post("/upload", (req, res) => {
  // If Cloudinary uploader is not available, return a clear 503 instead of invoking multer-storage-cloudinary
  if (!isCloudinaryAvailable) {
    console.error('Upload attempted but Cloudinary storage is not available');
    return res.status(503).json({ message: 'Image uploads are currently disabled on the server (Cloudinary not configured or disabled).' });
  }

  // run multer middleware manually to capture any errors it emits
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Upload middleware error:", err && err.stack ? err.stack : err);
      // Return a clear error to the client
      return res.status(500).json({ message: 'Upload middleware error on server', error: err.message || String(err) });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      return res.status(200).json({ imageUrl: req.file.path });
    } catch (err2) {
      console.error("Upload handler error:", err2 && err2.stack ? err2.stack : err2);
      return res.status(500).json({ message: "Upload failed", error: err2.message });
    }
  });
});

/**
 * GET /api/blogs/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: "Invalid blog id" });
  }
});

/**
 * POST /api/blogs
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    const blog = await Blog.create(payload);
    res.status(201).json(blog);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create blog", error: err.message });
  }
});

/**
 * PUT /api/blogs/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body;

    const updated = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Blog not found" });

    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update blog", error: err.message });
  }
});

/**
 * DELETE /api/blogs/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete blog" });
  }
});

export default router;