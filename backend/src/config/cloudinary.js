import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  // Use environment variables when available; fall back to provided credentials
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "coderslife",
  // Explicit API key/secret fallback (use your Render env vars for production)
  api_key: process.env.CLOUDINARY_API_KEY || "636567596127319",
  api_secret: process.env.CLOUDINARY_API_SECRET || "-ZzY46Ms9C5ZNT23X5_KErfYqFM",
});

export default cloudinary;
