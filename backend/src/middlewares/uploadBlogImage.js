import multer from "multer";
import cloudinary from "../config/cloudinary.js";

let upload;
export let isCloudinaryAvailable = false;

// Default safe fallback
upload = multer({ storage: multer.memoryStorage() });

try {
  // Load multer-storage-cloudinary using top-level await to avoid race condition.
  // This ensures Cloudinary storage is ready BEFORE routes start using `upload`.
  const pkg = await import("multer-storage-cloudinary");

  try {
    // Handle possible module shapes:
    // - pkg.CloudinaryStorage (ESM named export)
    // - pkg.default.CloudinaryStorage (CommonJS wrapped)
    // - pkg.default (module.exports = CloudinaryStorage)
    let CloudinaryStorage = undefined;

    if (pkg && pkg.CloudinaryStorage) {
      CloudinaryStorage = pkg.CloudinaryStorage;
    } else if (pkg && pkg.default && pkg.default.CloudinaryStorage) {
      CloudinaryStorage = pkg.default.CloudinaryStorage;
    } else if (pkg && pkg.default && typeof pkg.default === "function") {
      CloudinaryStorage = pkg.default;
    }

    if (typeof CloudinaryStorage !== "function") {
      throw new Error("CloudinaryStorage export not found or not a constructor");
    }

    // Check env variables (if missing, keep fallback)
    const CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
    const API_KEY = (process.env.CLOUDINARY_API_KEY || "").trim();
    const API_SECRET = (process.env.CLOUDINARY_API_SECRET || "").trim();

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.warn(
        "⚠️ Cloudinary credentials missing. Upload will use memory storage (no permanent URL)."
      );
    } else {
      const storage = new CloudinaryStorage({
        cloudinary,
        params: {
          folder: "blogs",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
      });

      upload = multer({ storage });
      isCloudinaryAvailable = true;
      console.log("✅ Cloudinary storage initialized successfully");
    }
  } catch (error) {
    console.warn(
      "⚠️ Failed to initialize Cloudinary storage, falling back to memory storage",
      error && error.message ? error.message : String(error)
    );
  }
} catch (error) {
  console.warn(
    "⚠️ multer-storage-cloudinary not available, using memory storage",
    error && error.message ? error.message : String(error)
  );
}

export default upload;
