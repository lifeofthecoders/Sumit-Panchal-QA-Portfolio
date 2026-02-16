import multer from "multer";
import CloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

let upload;
let isCloudinaryAvailable = false;

try {
  if (cloudinary && cloudinary.uploader) {
    // Cloudinary is configured — use cloudinary storage
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "blogs",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
    });

    upload = multer({ storage });
    isCloudinaryAvailable = true;
  } else {
    // Cloudinary uploader missing — fall back to memory storage so module load doesn't crash.
    console.warn("⚠️ Cloudinary uploader not available — using memory storage fallback for multer.");
    upload = multer({ storage: multer.memoryStorage() });
    isCloudinaryAvailable = false;
  }
} catch (err) {
  // Defensive: if multer-storage-cloudinary throws during initialization, fall back
  console.error("Error initializing Cloudinary storage, falling back to memory storage:", err && err.stack ? err.stack : err);
  upload = multer({ storage: multer.memoryStorage() });
  isCloudinaryAvailable = false;
}

export default upload;
export { isCloudinaryAvailable };
