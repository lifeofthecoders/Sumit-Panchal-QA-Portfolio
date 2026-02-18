import express from "express";
import Blog from "../models/Blog.js";
import upload, { isCloudinaryAvailable } from "../middlewares/uploadBlogImage.js";

const router = express.Router();

/**
 * GET /api/blogs
 * Returns all blogs, latest first
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments();

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: blogs,
      pagination: {
        totalBlogs: totalBlogs,
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
 * Upload image to Cloudinary for persistent, stable storage
 * IMPORTANT: This MUST be above "/:id" route
 */
router.post("/upload", (req, res) => {
  // run multer middleware manually so we can catch middleware errors
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Upload middleware error:", err && err.stack ? err.stack : err);
      return res.status(500).json({ message: "Upload middleware error", error: err.message || String(err) });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      // ✅ CLOUDINARY (preferred): Returns req.file.path = stable HTTPS URL
      if (isCloudinaryAvailable && req.file.path) {
        console.log("✅ Image uploaded to Cloudinary:", req.file.path);
        return res.status(200).json({ imageUrl: req.file.path });
      }

      // ❌ If Cloudinary failed or is not available, reject the upload
      // Do NOT fall back to local storage which becomes inaccessible after restart
      if (!isCloudinaryAvailable) {
        return res.status(503).json({
          message:
            "Image upload service is not available. Please ensure Cloudinary is configured in the backend environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
        });
      }

      // Edge case: Cloudinary claims to be available but didn't return a path
      if (!req.file.path) {
        return res.status(500).json({
          message: "Upload to Cloudinary succeeded but no URL was returned. This is an unexpected error.",
        });
      }
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
    // Validate image URL: do not allow saving local file paths, blob URLs or data URIs
    if (payload && payload.image && typeof payload.image === "string") {
      const img = payload.image.trim();
      if (
        !img.startsWith("http://") &&
        !img.startsWith("https://")
      ) {
        return res.status(400).json({ message: "Image must be an uploaded HTTP(S) URL. Please upload the image via /api/blogs/upload." });
      }
    }

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

    // Validate image URL on update as well
    if (payload && payload.image && typeof payload.image === "string") {
      const img = payload.image.trim();
      if (
        !img.startsWith("http://") &&
        !img.startsWith("https://")
      ) {
        return res.status(400).json({ message: "Image must be an uploaded HTTP(S) URL. Please upload the image via /api/blogs/upload." });
      }
    }

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
