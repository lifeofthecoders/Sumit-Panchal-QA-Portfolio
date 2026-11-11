
import express from "express";
import mongoose from "mongoose";

import Blog from "../models/Blog.js";
import upload from "../middlewares/uploadBlogImage.js";
import cloudinary from "../config/cloudinary.js";
import { verifyAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

const ALLOWED_BLOG_FIELDS = [
  "image",
  "type",
  "author",
  "profession",
  "date",
  "title",
  "description",
];

const getBlogPayload = (body) => {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return null;
  }

  const payload = {};

  for (const field of ALLOWED_BLOG_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }
  }

  return payload;
};

const validateImageUrl = (image) => {
  if (typeof image !== "string") {
    return { valid: false, image };
  }

  const normalizedImage = image.trim();

  if (!normalizedImage) {
    return { valid: true, image: normalizedImage };
  }

  try {
    const parsedUrl = new URL(normalizedImage);

    if (
      parsedUrl.protocol !== "https:" ||
      !parsedUrl.hostname ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      return { valid: false, image: normalizedImage };
    }

    return { valid: true, image: normalizedImage };
  } catch {
    return { valid: false, image: normalizedImage };
  }
};

const isValidBlogId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const handleBlogValidationError = (err, res, fallbackMessage) => {
  if (
    err?.name === "ValidationError" ||
    err?.name === "CastError" ||
    err?.name === "StrictModeError"
  ) {
    return res.status(400).json({
      message: "Invalid blog data. Please check the submitted fields.",
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      message: "A blog with this information already exists.",
    });
  }

  console.error("[BLOG ROUTES]", err);

  return res.status(500).json({
    message: fallbackMessage,
  });
};

/* ===========================
   PUBLIC ROUTES
=========================== */

/**
 * GET /api/blogs
 * Paginated blogs (latest first).
 * Public access.
 */
router.get("/", async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page || "1", 10);
    const requestedLimit = Number.parseInt(req.query.limit || "10", 10);

    const page = Number.isFinite(requestedPage)
      ? Math.max(requestedPage, 1)
      : 1;

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 10;

    const skip = (page - 1) * limit;

    const [totalBlogs, blogs] = await Promise.all([
      Blog.countDocuments(),
      Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      data: blogs,
      pagination: {
        totalBlogs,
        page,
        limit,
        totalPages: Math.ceil(totalBlogs / limit),
      },
    });
  } catch (err) {
    console.error("[BLOG ROUTES] GET / error:", err);

    return res.status(500).json({
      message: "Failed to fetch blogs",
    });
  }
});

/**
 * GET /api/blogs/:id
 * Get an individual blog.
 * Public access.
 */
router.get("/:id", async (req, res) => {
  try {
    if (!isValidBlogId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid blog id",
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json(blog);
  } catch (err) {
    console.error("[BLOG ROUTES] GET /:id error:", err);

    return res.status(500).json({
      message: "Failed to fetch blog",
    });
  }
});

/* ===========================
   PROTECTED ADMIN ROUTES
=========================== */

/**
 * POST /api/blogs/upload
 * Upload image to Cloudinary.
 * Administrator authentication required.
 *
 * IMPORTANT: Keep this route above "/:id".
 */
router.post(
  "/upload",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded",
        });
      }

      if (!Buffer.isBuffer(req.file.buffer)) {
        return res.status(400).json({
          message: "Upload failed: no valid file buffer received",
        });
      }

      const isCloudinaryConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
      );

      if (!isCloudinaryConfigured) {
        return res.status(503).json({
          message: "Image upload service is currently unavailable.",
        });
      }

      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        upload_preset: "qa_portfolio_preset",
        resource_type: "image",
      });

      if (
        !result?.secure_url ||
        !result.secure_url.startsWith("https://")
      ) {
        return res.status(502).json({
          message: "Image upload service did not return a valid secure URL.",
        });
      }

      return res.status(200).json({
        imageUrl: result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error("[BLOG ROUTES] Cloudinary upload error:", err);

      return res.status(502).json({
        message: "Image upload failed. Please try again.",
      });
    }
  }
);

/**
 * POST /api/blogs
 * Create a blog.
 * Administrator authentication required.
 */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const payload = getBlogPayload(req.body);

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).json({
        message: "Invalid blog data",
      });
    }

    if (Object.prototype.hasOwnProperty.call(payload, "image")) {
      const validation = validateImageUrl(payload.image);

      if (!validation.valid) {
        return res.status(400).json({
          message:
            "Image must be a valid HTTPS URL. Please upload the image via /api/blogs/upload.",
        });
      }

      payload.image = validation.image;
    }

    const blog = await Blog.create(payload);

    return res.status(201).json(blog);
  } catch (err) {
    return handleBlogValidationError(
      err,
      res,
      "Failed to create blog"
    );
  }
});

/**
 * PUT /api/blogs/:id
 * Update a blog.
 * Administrator authentication required.
 */
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    if (!isValidBlogId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid blog id",
      });
    }

    const updateData = getBlogPayload(req.body);

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    if (Object.prototype.hasOwnProperty.call(updateData, "image")) {
      const validation = validateImageUrl(updateData.image);

      if (!validation.valid) {
        return res.status(400).json({
          message:
            "Image must be a valid HTTPS URL. Please upload the image via /api/blogs/upload.",
        });
      }

      updateData.image = validation.image;
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return handleBlogValidationError(
      err,
      res,
      "Failed to update blog"
    );
  }
});

/**
 * DELETE /api/blogs/:id
 * Delete a blog.
 * Administrator authentication required.
 */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    if (!isValidBlogId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid blog id",
      });
    }

    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (err) {
    console.error("[BLOG ROUTES] DELETE /:id error:", err);

    return res.status(500).json({
      message: "Failed to delete blog",
    });
  }
});

export default router;