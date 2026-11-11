
import multer from "multer";

/**
 * Blog image upload configuration.
 *
 * Images are stored temporarily in memory so the blog route can
 * upload the validated buffer directly to Cloudinary.
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Check the actual binary signature of the uploaded image.
 * Do not trust the file extension or browser-provided MIME type alone.
 */
const validateImageSignature = (buffer, mimetype) => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  switch (mimetype) {
    case "image/jpeg":
      return (
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );

    case "image/png":
      return buffer.subarray(0, 8).equals(
        Buffer.from([
          0x89, 0x50, 0x4e, 0x47,
          0x0d, 0x0a, 0x1a, 0x0a,
        ])
      );

    case "image/webp":
      return (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );

    default:
      return false;
  }
};

/**
 * Multer configuration.
 */
const multerInstance = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 10,
    parts: 11,
  },

  fileFilter: (req, file, callback) => {
    if (!Object.prototype.hasOwnProperty.call(
      ALLOWED_IMAGE_TYPES,
      file.mimetype
    )) {
      const error = new Error(
        "Invalid image type. Only JPEG, PNG, and WEBP images are allowed."
      );

      error.status = 415;
      return callback(error);
    }

    callback(null, true);
  },
});

/**
 * Compatibility export.
 * Indicates whether Cloudinary credentials are configured.
 * Actual connectivity is checked by the Cloudinary health endpoint.
 */
export const isCloudinaryAvailable = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

/**
 * Upload middleware wrapper.
 *
 * Keeps compatibility with existing usage:
 * upload.single("image")
 *
 * It validates both the declared MIME type and actual file signature.
 */
const upload = {
  single: (fieldName) => {
    const multerSingle = multerInstance.single(fieldName);

    return (req, res, next) => {
      multerSingle(req, res, (error) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
              return res.status(413).json({
                success: false,
                message: "Image exceeds the maximum allowed size of 10 MB.",
              });
            }

            return res.status(400).json({
              success: false,
              message: "Invalid image upload request.",
            });
          }

          return res.status(error.status || 400).json({
            success: false,
            message: error.message || "Image upload failed.",
          });
        }

        if (!req.file) {
          return next();
        }

        const validImage = validateImageSignature(
          req.file.buffer,
          req.file.mimetype
        );

        if (!validImage) {
          return res.status(415).json({
            success: false,
            message:
              "The uploaded file is not a valid JPEG, PNG, or WEBP image.",
          });
        }

        next();
      });
    };
  },
};

export default upload;
