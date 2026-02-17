import multer from "multer";
import cloudinary from "../config/cloudinary.js";

let upload;
export let isCloudinaryAvailable = false;

try {
  // Dynamically import the package and handle multiple export shapes so the
  // server doesn't crash if the package exports differ between environments.
  import("multer-storage-cloudinary")
    .then((pkg) => {
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
