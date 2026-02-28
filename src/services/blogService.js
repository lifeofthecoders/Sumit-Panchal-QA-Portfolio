import API_BASE_URL from "../config/api";

/**
 * Check if backend is accessible
 */
const checkBackendHealth = async (timeout = 10000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
};

/**
 * GET all blogs (latest first)
 */
export const getBlogs = async () => {
  const res = await fetch(`${API_BASE_URL}/api/blogs`);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return await res.json();
};

/**
 * GET single blog
 */
export const getBlogById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
  if (!res.ok) return null;
  return await res.json();
};

/**
 * Create or Update blog
 */
export const saveBlog = async (blog) => {
  // Update
  if (blog.id) {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });

    if (!res.ok) throw new Error("Failed to update blog");
    return await res.json();
  }

  // Create
  const payload = { ...blog };
  delete payload.id;

  const res = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create blog");
  return await res.json();
};

/**
 * Delete blog
 */
export const deleteBlog = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete blog");
  return true;
};

/**
 * Paginated Blogs
 */
export const getBlogsPaginated = async (page = 1, limit = 10) => {
  const res = await fetch(
    `${API_BASE_URL}/api/blogs?page=${page}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return await res.json();
};

/**
 * Upload Blog Image (Computer Upload → Cloudinary)
 */
export const uploadBlogImage = async (file, onProgress) => {
  const uploadUrl = `${API_BASE_URL}/api/blogs/upload`;
  const formData = new FormData();
  formData.append("image", file);

  // Optional: warm backend (Render cold start protection)
  if (API_BASE_URL.includes("onrender.com")) {
    if (onProgress) onProgress(5);
    checkBackendHealth(30000).catch(() => {
      console.warn("⚠️ Backend health check failed, proceeding anyway");
    });
  }

  // Progress-based upload
  if (onProgress && typeof onProgress === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let timeoutOccurred = false;

      const timeout = setTimeout(() => {
        timeoutOccurred = true;
        xhr.abort();
      }, 300000);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.min((e.loaded / e.total) * 90, 90);
          onProgress(Math.max(5, percent));
        }
      });

      xhr.addEventListener("load", () => {
        clearTimeout(timeout);
        onProgress(95);

        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const data = JSON.parse(xhr.responseText);
            const url = data.imageUrl || data.url;

            if (!url || !url.startsWith("http")) {
              reject(new Error("Upload returned invalid image URL"));
              return;
            }

            onProgress(100);
            resolve(url);
          } catch (err) {
            reject(new Error("Invalid upload response"));
          }
        } else {
          reject(
            new Error(`Upload failed (${xhr.status}) at ${uploadUrl}`)
          );
        }
      });

      xhr.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error(`Network error: Cannot reach ${uploadUrl}`));
      });

      xhr.addEventListener("abort", () => {
        clearTimeout(timeout);
        if (timeoutOccurred) {
          reject(
            new Error(
              `Upload timeout (5 min exceeded) at ${uploadUrl}`
            )
          );
        } else {
          reject(new Error("Upload cancelled"));
        }
      });

      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    });
  }

  // Simple upload fallback
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000);

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    signal: controller.signal,
  });

  clearTimeout(timeout);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Image upload failed");
  }

  const url = data.imageUrl || data.url;

  if (!url || !url.startsWith("http")) {
    throw new Error("Upload returned invalid image URL");
  }

  return url;
};

/**
 * Validate image URL
 */
export const ensureImageIsRemote = (image) => {
  if (!image) return true;
  if (typeof image !== "string") return false;
  const v = image.trim();
  return v.startsWith("http://") || v.startsWith("https://");
};