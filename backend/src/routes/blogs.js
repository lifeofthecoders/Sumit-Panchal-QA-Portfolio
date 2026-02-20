import express from "express";
import Blog from "../models/Blog.js";
import upload, { isCloudinaryAvailable } from "../middlewares/uploadBlogImage.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/**
 * ===========================
 * GET /api/blogs
 * Paginated blogs (latest first)
 * ===========================
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

    return res.json({
      data: blogs,
      pagination: {
        totalBlogs,
        page,
        limit,
        totalPages: Math.ceil(totalBlogs / limit),
      },
    });
  } catch (err) {
    console.error("🟥 [BLOG ROUTES] GET /api/blogs error:", err);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

/**
 * ===========================
 * POST /api/blogs/upload
 * Upload image to Cloudinary (Base64 upload)
 * IMPORTANT: MUST be above "/:id"
 * ===========================
 */
router.post("/upload", upload.single("image"), async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

     if (!isCloudinaryAvailable) {
      return res.status(503).json({
        message:
          "Cloudinary upload is not available. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
      });
    }

    if (!req.file.buffer) {
      return res.status(500).json({
        message: "Upload failed: no file buffer received",
      });
    }


    // ✅ Convert buffer to base64 data URI
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
      "base64"
    )}`;

        // ✅ Upload using signed preset
    const result = await cloudinary.uploader.upload(base64Image, {
      upload_preset: "qa_portfolio_preset",
    });

    if (!result?.secure_url) {
      return res.status(500).json({
        message: "Upload failed: Cloudinary did not return a URL.",
      });
    }


    return res.status(200).json({
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("🟥 [BLOG ROUTES] Upload handler error:", err);

    return res.status(500).json({
      message: "Upload failed",
      error: err.message || String(err),
    });
  }
});

/**
 * ===========================
 * GET /api/blogs/:id
 * ===========================
 */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  } catch {
    return res.status(400).json({ message: "Invalid blog id" });
  }
});

/**
 * ===========================
 * POST /api/blogs
 * ===========================
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    if (payload?.image && typeof payload.image === "string") {
      const img = payload.image.trim();
      if (!img.startsWith("http://") && !img.startsWith("https://")) {
        return res.status(400).json({
          message:
            "Image must be an uploaded HTTP(S) URL. Please upload the image via /api/blogs/upload.",
        });
      }
    }

    const blog = await Blog.create(payload);
    return res.status(201).json(blog);
  } catch (err) {
    return res.status(400).json({
      message: "Failed to create blog",
      error: err.message,
    });
  }
});

/**
 * ===========================
 * PUT /api/blogs/:id
 * ===========================
 */
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body;

    if (payload?.image && typeof payload.image === "string") {
      const img = payload.image.trim();
      if (!img.startsWith("http://") && !img.startsWith("https://")) {
        return res.status(400).json({
          message:
            "Image must be an uploaded HTTP(S) URL. Please upload the image via /api/blogs/upload.",
        });
      }
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Blog not found" });

    return res.json(updated);
  } catch (err) {
    return res.status(400).json({
      message: "Failed to update blog",
      error: err.message,
    });
  }
});

/**
 * ===========================
 * DELETE /api/blogs/:id
 * ===========================
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ message: "Failed to delete blog" });
  }
});

export default router;
