import express from "express";
import multer from "multer";
import Blog from "../models/Blog.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ───────────────────────────────────────────────
// Multer config (same as before)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// ───────────────────────────────────────────────
// Cloudinary helpers (enhanced logging)
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  console.log("[CLOUDINARY-CHECK] Status:", {
    name: name ? name.substring(0, 5) + '...' : 'MISSING',
    key: key ? key.substring(0, 5) + '...' : 'MISSING',
    secret: !!secret ? 'present' : 'MISSING',
  });

  return Boolean(name && key && secret);
};

const uploadToCloudinary = async (buffer) => {
  console.log("[CLOUDINARY] Starting upload - buffer size:", buffer?.length || 0);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Cloudinary timeout (30s)")), 30000);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "qa-portfolio/blogs",
        resource_type: "image",
        quality: "auto:good",
        fetch_format: "auto",
      },
      (error, result) => {
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer, (err) => {
      if (err) reject(err);
    });
  });
};

// ───────────────────────────────────────────────
// UPLOAD ROUTE - Manual Multer + full safety
router.post("/upload", (req, res) => {
  console.log("╔═══════════════════════════════╗");
  console.log("║ UPLOAD ROUTE STARTED " + new Date().toISOString() + " ║");
  console.log("╚═══════════════════════════════╝");

  // Manually run Multer
  upload.single("image")(req, res, async (multerErr) => {
    if (multerErr) {
      console.error("[UPLOAD] MULTER FAILED:", {
        message: multerErr.message,
        code: multerErr.code,
        stack: multerErr.stack?.substring(0, 300),
      });

      return res.status(400).json({
        success: false,
        message: "File upload processing error: " + (multerErr.message || "Multer error"),
      });
    }

    try {
      console.log("[UPLOAD] Multer success - file present:", !!req.file);

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file" });
      }

      console.log("[UPLOAD] File details:", {
        name: req.file.originalname,
        sizeKB: (req.file.size / 1024).toFixed(2),
        bufferBytes: req.file.buffer.length,
      });

      if (!isCloudinaryConfigured()) {
        return res.status(503).json({ success: false, message: "Cloudinary not configured" });
      }

      const result = await uploadToCloudinary(req.file.buffer);

      if (!result?.secure_url) {
        throw new Error("No secure_url from Cloudinary");
      }

      console.log("[UPLOAD] SUCCESS - public_id:", result.public_id);

      return res.status(200).json({
        success: true,
        imageUrl: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error("[UPLOAD CRASH]", {
        message: err.message,
        code: err.code,
        isAuth: /auth|key|signature/i.test(err.message || ""),
        stack: err.stack?.substring(0, 300),
      });

      const status = /timeout/i.test(err.message) ? 408 : /auth|key|signature/i.test(err.message) ? 503 : 500;

      return res.status(status).json({
        success: false,
        message: status === 503 ? "Cloudinary auth failed" : "Upload failed",
        error: err.message.substring(0, 150),
      });
    } finally {
      console.log("╭─────────────────────────────────────╮");
      console.log("│ UPLOAD ROUTE FINISHED               │");
      console.log("╰─────────────────────────────────────╯");
    }
  });
});

// ───────────────────────────────────────────────
// All other routes unchanged - keep exactly as they are
// (GET /, GET /:id, POST /, PUT /:id, DELETE /:id)
// ───────────────────────────────────────────────

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