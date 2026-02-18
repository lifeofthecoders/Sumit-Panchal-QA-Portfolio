import express from "express";
import Blog from "../models/Blog.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/**
 * ============================
 * Multer (Memory Storage) - FASTEST + Render Friendly
 * ============================
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * ============================
 * Helpers
 * ============================
 */
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const uploadToCloudinaryStream = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "qa-portfolio/blogs",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

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
 * FAST + STABLE Cloudinary upload (NO disk storage)
 * IMPORTANT: This MUST be above "/:id" route
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  const startTime = Date.now();

  try {
    console.log("📤 [UPLOAD START] New upload request received");

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Image upload service is not available. Please ensure Cloudinary is configured in the backend environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    if (!req.file.buffer) {
      return res.status(400).json({ message: "Invalid image buffer" });
    }

    console.log(
      `📤 [UPLOAD RECEIVED] ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`
    );

    // Upload directly to Cloudinary (fast)
    const result = await uploadToCloudinaryStream(req.file.buffer);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
      `✅ [UPLOAD SUCCESS] Cloudinary upload done in ${totalTime}s: ${result.secure_url}`
    );

    return res.status(200).json({
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.error(`❌ [UPLOAD ERROR] Failed after ${totalTime}s:`, err);

    // Better error message for client
    if (
      err?.message?.toLowerCase()?.includes("timeout") ||
      err?.message?.toLowerCase()?.includes("timed out")
    ) {
      return res.status(408).json({
        message:
          "Cloudinary upload timeout. Please try again. If it continues, upload a smaller image.",
        error: err.message || String(err),
      });
    }

    return res.status(500).json({
      message: "Image upload failed",
      error: err.message || String(err),
    });
  }
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
      if (!img.startsWith("http://") && !img.startsWith("https://")) {
        return res.status(400).json({
          message:
            "Image must be an uploaded HTTP(S) URL. Please upload the image via /api/blogs/upload.",
        });
      }
    }

    const blog = await Blog.create(payload);
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ message: "Failed to create blog", error: err.message });
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

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update blog", error: err.message });
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
