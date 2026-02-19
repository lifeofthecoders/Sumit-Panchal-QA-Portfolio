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
  const configured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!configured) {
    console.error("Cloudinary credentials missing in environment variables");
  }

  return configured;
};

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream;

    try {
      stream = cloudinary.uploader.upload_stream(
        {
          folder: "qa-portfolio/blogs",
          resource_type: "image",
          quality: "auto:good",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    } catch (setupError) {
      return reject(new Error(`Cloudinary stream setup failed: ${setupError.message}`));
    }

    const timeout = setTimeout(() => {
      try {
        stream?.destroy();
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
  console.log("[UPLOAD] Request received at", new Date().toISOString());

  try {
    // Step 1: Log environment (without exposing full secret)
    console.log("[UPLOAD] Cloud name prefix:", process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 5) || "missing");
    console.log("[UPLOAD] API key prefix:", process.env.CLOUDINARY_API_KEY?.substring(0, 5) || "missing");
    console.log("[UPLOAD] API secret prefix:", process.env.CLOUDINARY_API_SECRET ? "present" : "missing");

    if (!isCloudinaryConfigured()) {
      console.error("[UPLOAD] Cloudinary credentials MISSING in env");
      return res.status(503).json({
        success: false,
        message: "Cloudinary configuration missing",
      });
    }

    console.log("[UPLOAD] Cloudinary config check passed");

    if (!req.file) {
      console.log("[UPLOAD] No file in request");
      return res.status(400).json({
        success: false,
        message: "No image file received",
      });
    }

    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log("[UPLOAD] Empty buffer received");
      return res.status(400).json({
        success: false,
        message: "Image file is empty",
      });
    }

    console.log(
      `[UPLOAD] File info → name: ${req.file.originalname}, ` +
      `size: ${(req.file.size / 1024).toFixed(2)} KB, ` +
      `mimetype: ${req.file.mimetype}`
    );

    console.log("[UPLOAD] Starting upload to Cloudinary...");

    const result = await uploadToCloudinary(req.file.buffer);

    console.log("[UPLOAD] Cloudinary returned → public_id:", result?.public_id);

    if (!result?.secure_url) {
      console.error("[UPLOAD] Missing secure_url in result");
      throw new Error("Cloudinary did not return image URL");
    }

    return res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: err.message || "Unknown error",
      name: err.name,
      code: err.code || err.http_code || null,
      isAuth: /auth|key|secret|signature|credential/i.test(err.message || ""),
      isTimeout: /timeout|timed out/i.test(err.message || ""),
      stackFirst: err.stack ? err.stack.split("\n")[0] : null,
      fileSize: req.file?.size,
      fileName: req.file?.originalname,
    };

    console.error("[UPLOAD CRASH]", JSON.stringify(errorInfo, null, 2));

    let status = 500;
    let clientMessage = "Image upload failed";

    if (errorInfo.isTimeout) {
      status = 408;
      clientMessage = "Upload timed out (30s)";
    } else if (errorInfo.isAuth) {
      status = 503;
      clientMessage = "Cloudinary authentication error – check API credentials";
    } else if (err.message?.includes("stream setup failed")) {
      status = 503;
      clientMessage = "Cloudinary initialization failed";
    }

    return res.status(status).json({
      success: false,
      message: clientMessage,
      errorCode: err.code || "unknown",
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
    console.error("Error fetching blogs:", err.message);
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
    console.error("Error fetching blog:", err.message);
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
    console.error("Error creating blog:", err.message);
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
        console.log(`Deleted old image: ${blog.public_id}`);
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
    console.error("Error updating blog:", err.message);
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
        console.log(`Deleted image on blog delete: ${blog.public_id}`);
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
    console.error("Error deleting blog:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
});

export default router;