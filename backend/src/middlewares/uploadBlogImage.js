import multer from "multer";
import cloudinary from "../config/cloudinary.js";

let upload;
export let isCloudinaryAvailable = false;

try {
  import("multer-storage-cloudinary")
    .then((pkg) => {
      try {
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

        // ✅ IMPORTANT FIX:
        // multer-storage-cloudinary expects a cloudinary object that has `.uploader`
        // Make sure we pass the correct v2 instance
        if (!cloudinary || !cloudinary.uploader) {
          throw new Error("Cloudinary instance is invalid (missing uploader)");
        }

        const storage = new CloudinaryStorage({
          cloudinary: cloudinary,
          params: async (req, file) => {
            return {
              folder: "blogs",
              allowed_formats: ["jpg", "jpeg", "png", "webp"],
              resource_type: "image",
            };
          },
        });

        upload = multer({ storage });
        isCloudinaryAvailable = true;
        console.log("✅ Cloudinary storage initialized successfully");
      } catch (error) {
        console.warn(
          "⚠️ Failed to initialize Cloudinary storage, falling back to memory storage",
          error && error.message ? error.message : String(error)
        );
        upload = multer({ storage: multer.memoryStorage() });
      }
    })
    .catch((error) => {
      console.warn(
        "⚠️ multer-storage-cloudinary not available, using memory storage",
        error && error.message ? error.message : String(error)
      );
      upload = multer({ storage: multer.memoryStorage() });
    });
} catch (error) {
  console.warn(
    "⚠️ Error loading Cloudinary storage module, using memory storage",
    error.message
  );
  upload = multer({ storage: multer.memoryStorage() });
}

// Fallback in case async initialization hasn't completed
if (!upload) {
  upload = multer({ storage: multer.memoryStorage() });
}

export default upload;
