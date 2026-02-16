import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from environment variables. For security, do NOT commit
// your real credentials to source control — set them in the deployment environment
// (Render dashboard / environment variables) as CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Warn in logs when credentials are missing (helps during deployment debugging)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn(
    "⚠️ Cloudinary credentials are not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment."
  );
}

export default cloudinary;
