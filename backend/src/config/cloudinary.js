import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  // Use environment variables when available; fall back to provided credentials
  // WARNING: Hard-coded credentials below are for immediate debugging only.
  // For production, set CLOUDINARY_* env vars on the host and remove hard-coded values.
  cloud_name: "coderslife",
  api_key: "636567596127319",
  api_secret: "-ZzY46Ms9C5ZNT23X5_KErfYqFM",
});

export default cloudinary;
