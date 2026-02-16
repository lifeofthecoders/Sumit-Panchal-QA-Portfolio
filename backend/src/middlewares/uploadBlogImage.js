import multer from "multer";
import cloudinary from "../config/cloudinary.js";

// ✅ This is the correct way to import CommonJS packages in ESM
import pkg from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

export default upload;
