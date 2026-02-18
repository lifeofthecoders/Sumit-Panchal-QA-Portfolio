/**
 * Image utility functions for optimization
 */

/**
 * Compress image before upload
 * Reduces file size while maintaining reasonable quality
 */
export const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to initialize canvas context"));
          return;
        }

        // Set canvas dimensions (limit to 1920px max width)
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with reduced quality (0.75 = 75% quality)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed (blob is null)"));
              return;
            }

            // Preserve original name but ensure .jpg extension (since output is jpeg)
            const baseName = file.name?.replace(/\.[^/.]+$/, "") || "image";
            const newFileName = `${baseName}.jpg`;

            // Create a new File object from the blob
            const compressedFile = new File([blob], newFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          0.75 // Quality setting (0-1)
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * NOTE:
 * - Type errors should block upload
 * - Size errors should NOT block (because we compress automatically)
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  // Check file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload JPG, PNG, WebP, or GIF.",
    };
  }

  // Check file size (max 10MB) — WARNING ONLY
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: true,
      warning: `File size (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB) is above 10MB. Compressing automatically...`,
    };
  }

  return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
