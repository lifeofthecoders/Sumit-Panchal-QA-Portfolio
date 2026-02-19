import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import CloudinaryStorage from "multer-storage-cloudinary";

let upload;
export let isCloudinaryAvailable = false;

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  cloudinary &&
  cloudinary.uploader
);

if (isCloudinaryConfigured) {
  try {
    // ✅ Use CloudinaryStorage for persistent, stable image hosting
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        console.log("📝 Preparing Cloudinary upload for file:", file.originalname);
        return {
          folder: "blogs",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          resource_type: "image",
          // ✅ Use HTTP instead of HTTPS to avoid redirect issues on some CDNs
          secure: true,
          // Add timeout to Cloudinary API calls
          timeout: 60000, // 60 seconds
        };
      },
    });

    upload = multer({ 
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
      },
      timeout: 300000, // 5 minute timeout for multipart form parsing
    });
    isCloudinaryAvailable = true;
    console.log("✅ Cloudinary storage initialized successfully");
  } catch (error) {
    console.error(
      "❌ Failed to initialize Cloudinary storage:",
      error && error.message ? error.message : String(error)
    );
    console.warn("⚠️  Falling back to memory storage (TEMPORARY - images will be lost on restart)");
    upload = multer({ storage: multer.memoryStorage() });
  }
} else {
  console.warn(
    "⚠️ Cloudinary is not properly configured. Using memory storage (TEMPORARY - images will be lost on restart)."
  );
  console.warn(
    "   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env"
  );
  upload = multer({ storage: multer.memoryStorage() });
}

export default upload;
