import multer from "multer";
import cloudinary from "../config/cloudinary.js";

let upload;
export let isCloudinaryAvailable = false;

try {
  // ✅ This is the correct way to import CommonJS packages in ESM
  import("multer-storage-cloudinary").then((pkg) => {
    try {
      const { CloudinaryStorage } = pkg;
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
        error.message
      );
      upload = multer({ storage: multer.memoryStorage() });
    }
  }).catch((error) => {
    console.warn(
      "⚠️ multer-storage-cloudinary not available, using memory storage",
      error.message
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
