import express from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

/**
 * ============================
 * Multer (Memory Storage)
 * ============================
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

/**
 * ============================
 * Cloudinary Helpers
 * ============================
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

const uploadToCloudinary = (buffer) => {
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

    // ✅ FIX: Hard timeout so request never hangs forever
    const timeout = setTimeout(() => {
      try {
        stream.destroy();
      } catch {}
      reject(new Error("Cloudinary upload timeout (30s)"));
    }, 30000);

    stream.on("finish", () => clearTimeout(timeout));
    stream.on("error", () => clearTimeout(timeout));

    stream.end(buffer);
  });
};

/**
 * ============================
 * POST /api/blogs/upload
 * ============================
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary is not configured. Please set environment variables.",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    // ✅ Safety: Cloudinary should always return secure_url
    if (!result || !result.secure_url) {
      return res.status(500).json({
        message: "Cloudinary upload failed: No secure_url returned",
      });
    }

    return res.status(200).json({
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("❌ Image upload error:", err);

    // ✅ Better error for timeout
    if (
      err?.message?.toLowerCase()?.includes("timeout") ||
      err?.message?.toLowerCase()?.includes("timed out")
    ) {
      return res.status(408).json({
        message: "Image upload timeout. Please try again.",
        error: err.message,
      });
    }

    return res.status(500).json({
      message: "Image upload failed",
      error: err.message,
    });
  }
});

/**
 * ============================
 * GET /api/blogs
 * ============================
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

/**
 * ============================
 * GET /api/blogs/:id
 * ============================
 */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch {
    res.status(400).json({ message: "Invalid blog id" });
  }
});

/**
 * ============================
 * POST /api/blogs
 * ============================
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    // Validate image URL
    if (payload.image && !payload.image.startsWith("https://")) {
      return res.status(400).json({
        message:
          "Image must be uploaded via /api/blogs/upload and be a valid URL",
      });
    }

    const blog = await Blog.create(payload);
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create blog",
      error: err.message,
    });
  }
});

/**
 * ============================
 * PUT /api/blogs/:id
 * ============================
 */
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body;

    if (payload.image && !payload.image.startsWith("https://")) {
      return res.status(400).json({
        message:
          "Image must be uploaded via /api/blogs/upload and be a valid URL",
      });
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update blog",
      error: err.message,
    });
  }
});

/**
 * ============================
 * DELETE /api/blogs/:id
 * ============================
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json({ success: true });
  } catch {
    res.status(400).json({ message: "Failed to delete blog" });
  }
});

export default router;
