import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn("⚠️ Cloudinary env vars missing:");
  console.warn("CLOUDINARY_CLOUD_NAME:", !!cloudName);
  console.warn("CLOUDINARY_API_KEY:", !!apiKey);
  console.warn("CLOUDINARY_API_SECRET:", !!apiSecret);
} else {
  console.log("✅ Cloudinary env vars loaded successfully");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
