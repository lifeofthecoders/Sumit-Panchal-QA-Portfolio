import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from environment variables.
// Do NOT commit real credentials — set them in Render Environment Variables.
const CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const API_KEY = (process.env.CLOUDINARY_API_KEY || "").trim();
const API_SECRET = (process.env.CLOUDINARY_API_SECRET || "").trim();

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

// Warn in logs when credentials are missing (helps during deployment debugging)
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn(
    "⚠️ Cloudinary credentials are not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment."
  );
}

export default cloudinary;
