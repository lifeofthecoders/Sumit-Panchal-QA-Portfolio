import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import pkg from "multer-storage-cloudinary";

const { CloudinaryStorage } = pkg;

// Configure Cloudinary again here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "qa-portfolio",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

const upload = multer({ storage });

export default upload;