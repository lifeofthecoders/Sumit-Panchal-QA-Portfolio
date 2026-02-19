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
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  const configured = Boolean(name && key && secret);

  console.log("[CLOUDINARY-CHECK] Status:", {
    name: name ? name.substring(0, 5) + '...' : 'MISSING',
    key: key ? key.substring(0, 5) + '...' : 'MISSING',
    secret: secret ? 'present' : 'MISSING',
    configured,
  });

  return configured;
};

const uploadToCloudinary = async (buffer) => {
  console.log("[CLOUDINARY] uploadToCloudinary called - buffer length:", buffer?.length || 0);

  return new Promise((resolve, reject) => {
    console.log("[CLOUDINARY] Creating upload stream...");

    const timeout = setTimeout(() => {
      console.log("[CLOUDINARY] Timeout 30s triggered");
      reject(new Error("Cloudinary upload timeout (30s)"));
    }, 30000);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "qa-portfolio/blogs",
        resource_type: "image",
        quality: "auto:good",
        fetch_format: "auto",
      },
      (error, result) => {
        clearTimeout(timeout);
        if (error) {
          console.error("[CLOUDINARY] Upload stream error:", error.message);
          reject(error);
        } else {
          console.log("[CLOUDINARY] Upload success - public_id:", result?.public_id);
          resolve(result);
        }
      }
    );

    console.log("[CLOUDINARY] Stream created, writing buffer...");
    stream.end(buffer, (err) => {
      if (err) {
        console.error("[CLOUDINARY] stream.end error:", err.message);
        clearTimeout(timeout);
        reject(err);
      }
    });
  });
};

/**
 * ============================
 * POST /api/blogs/upload - FINAL SAFE VERSION
 * ============================
 */
router.post("/upload", (req, res, next) => {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║ UPLOAD ROUTE ENTERED - " + new Date().toISOString() + " ║");
  console.log("╚════════════════════════════════════════════╝");

  // Multer middleware is applied here - any sync error from multer will be caught
  upload.single("image")(req, res, async (multerErr) => {
    if (multerErr) {
      console.error("[UPLOAD] Multer error:", multerErr.message, multerErr.stack?.substring(0, 200));
      return res.status(400).json({
        success: false,
        message: "File processing error: " + (multerErr.message || "Multer failed"),
      });
    }

    try {
      console.log("[UPLOAD] Multer completed successfully");

      if (!isCloudinaryConfigured()) {
        return res.status(503).json({
          success: false,
          message: "Cloudinary credentials missing",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image received",
        });
      }

      console.log("[UPLOAD] File:", {
        name: req.file.originalname,
        sizeKB: (req.file.size / 1024).toFixed(2),
        bufferBytes: req.file.buffer?.length || 0,
      });

      const result = await uploadToCloudinary(req.file.buffer);

      if (!result?.secure_url) {
        throw new Error("Cloudinary missing secure_url");
      }

      console.log("[UPLOAD] SUCCESS → URL:", result.secure_url.substring(0, 60) + "...");

      return res.status(200).json({
        success: true,
        imageUrl: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error("[UPLOAD CRASH FULL]", {
        message: err.message,
        name: err.name,
        code: err.code,
        http_code: err.http_code,
        isAuth: /auth|key|secret|signature/i.test(err.message || ""),
        stack: err.stack?.substring(0, 400),
      });

      const status = /timeout/i.test(err.message) ? 408 : /auth|key|signature/i.test(err.message) ? 503 : 500;

      return res.status(status).json({
        success: false,
        message: status === 503 ? "Cloudinary auth failed" : status === 408 ? "Timeout" : "Upload failed",
        error: err.message.substring(0, 150),
      });
    } finally {
      console.log("╔════════════════════════════════════════════╗");
      console.log("║ UPLOAD ROUTE EXITED                        ║");
      console.log("╚════════════════════════════════════════════╝");
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// All other routes remain EXACTLY the same as your current code
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/blogs
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
    console.error("Error fetching blogs:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
});

/**
 * GET /api/blogs/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.status(200).json({ success: true, data: blog });
  } catch (err) {
    console.error("Error fetching blog:", err.message);
    res.status(400).json({ success: false, message: "Invalid blog ID" });
  }
});

/**
 * POST /api/blogs
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    if (payload.image && !payload.image.startsWith("https://")) {
      return res.status(400).json({ success: false, message: "Invalid image URL" });
    }
    const blog = await Blog.create(payload);
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    console.error("Error creating blog:", err.message);
    res.status(400).json({ success: false, message: "Failed to create blog" });
  }
});

/**
 * PUT /api/blogs/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const payload = req.body;
    if (payload.image && !payload.image.startsWith("https://")) {
      return res.status(400).json({ success: false, message: "Invalid image URL" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (payload.image && payload.image !== blog.image && blog.public_id) {
      try {
        await cloudinary.uploader.destroy(blog.public_id);
        console.log(`Deleted old image: ${blog.public_id}`);
      } catch (deleteErr) {
        console.warn("Failed to delete old image:", deleteErr.message);
      }
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating blog:", err.message);
    res.status(400).json({ success: false, message: "Failed to update blog" });
  }
});

/**
 * DELETE /api/blogs/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (blog.public_id) {
      try {
        await cloudinary.uploader.destroy(blog.public_id);
        console.log(`Deleted image: ${blog.public_id}`);
      } catch (deleteErr) {
        console.warn("Failed to delete image:", deleteErr.message);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("Error deleting blog:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  }
});

export default router;