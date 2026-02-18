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
        success: false,
        message: "Cloudinary not configured",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    if (!result || !result.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed",
      });
    }

    return res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("❌ Image upload error:", err);

    if (
      err?.message?.toLowerCase()?.includes("timeout") ||
      err?.message?.toLowerCase()?.includes("timed out")
    ) {
      return res.status(408).json({
        success: false,
        message: "Upload timeout",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
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

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
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
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
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

    if (payload.image && !payload.image.startsWith("https://")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL",
      });
    }

    const blog = await Blog.create(payload);
    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(400).json({
      success: false,
      message: "Failed to create blog",
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
        success: false,
        message: "Invalid image URL",
      });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (payload.image && payload.image !== blog.image && blog.public_id) {
      try {
        await cloudinary.uploader.destroy(blog.public_id);
      } catch (deleteErr) {
        console.warn("Failed to delete old image:", deleteErr.message);
      }
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(400).json({
      success: false,
      message: "Failed to update blog",
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
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.public_id) {
      try {
        await cloudinary.uploader.destroy(blog.public_id);
      } catch (deleteErr) {
        console.warn("Failed to delete image:", deleteErr.message);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Blog deleted",
    });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
});

export default router;