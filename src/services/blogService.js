
import API_BASE_URL from "../config/api";

/* =========================
   AUTHENTICATION HELPERS
========================= */

const getAdminToken = () => {
  const token = localStorage.getItem("admin-token");

  if (!token) {
    redirectToAdminLogin();
    throw new Error("Authentication required. Please log in.");
  }

  return token;
};

const getAdminLoginUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;

  return `${normalizedBaseUrl}#/admin/login`;
};

const redirectToAdminLogin = () => {
  localStorage.removeItem("admin-token");
  window.location.replace(getAdminLoginUrl());
};

const handleUnauthorized = () => {
  redirectToAdminLogin();
};

const getAuthenticatedHeaders = (additionalHeaders = {}) => {
  const token = getAdminToken();

  return {
    ...additionalHeaders,
    Authorization: `Bearer ${token}`,
  };
};

/* =========================
   BACKEND HEALTH CHECK
========================= */

const checkBackendHealth = async (timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    });

    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

/* =========================
   PUBLIC BLOG READ OPERATIONS
========================= */

/**
 * GET all blogs (latest first).
 * Public access.
 */
export const getBlogs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/blogs`);

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return await response.json();
};

/**
 * GET single blog.
 * Public access.
 */
export const getBlogById = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    return null;
  }

  return await response.json();
};

/**
 * GET paginated blogs.
 * Public access.
 */
export const getBlogsPaginated = async (page = 1, limit = 10) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));

  const response = await fetch(
    `${API_BASE_URL}/api/blogs?page=${safePage}&limit=${safeLimit}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return await response.json();
};

/* =========================
   PROTECTED ADMIN OPERATIONS
========================= */

/**
 * Create or update a blog.
 * Requires administrator authentication.
 */
export const saveBlog = async (blog) => {
  if (!blog || typeof blog !== "object") {
    throw new Error("Invalid blog data");
  }

  const token = getAdminToken();

  const isUpdate = Boolean(blog.id);

  let url = `${API_BASE_URL}/api/blogs`;
  let method = "POST";
  let payload = { ...blog };

  if (isUpdate) {
    url = `${API_BASE_URL}/api/blogs/${encodeURIComponent(blog.id)}`;
    method = "PUT";
  } else {
    delete payload.id;
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Your admin session has expired. Please log in again.");
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        (isUpdate ? "Failed to update blog" : "Failed to create blog")
    );
  }

  return data;
};

/**
 * Delete a blog.
 * Requires administrator authentication.
 */
export const deleteBlog = async (id) => {
  if (!id) {
    throw new Error("Blog ID is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/blogs/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: getAuthenticatedHeaders(),
    }
  );

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Your admin session has expired. Please log in again.");
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete blog");
  }

  return true;
};

/* =========================
   PROTECTED IMAGE UPLOAD
========================= */

/**
 * Upload Blog Image (Computer Upload → Cloudinary).
 * Requires administrator authentication.
 */
export const uploadBlogImage = async (file, onProgress) => {
  if (!(file instanceof File)) {
    throw new Error("Please select a valid image file");
  }

  const token = getAdminToken();
  const uploadUrl = `${API_BASE_URL}/api/blogs/upload`;

  const formData = new FormData();
  formData.append("image", file);

  // Optional Render backend warm-up.
  if (API_BASE_URL.includes("onrender.com")) {
    if (onProgress) {
      onProgress(5);
    }

    checkBackendHealth(30000).catch(() => {
      console.warn("Backend health check failed, proceeding anyway.");
    });
  }

  // Progress-based upload using XMLHttpRequest.
  if (typeof onProgress === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let timeoutOccurred = false;

      const timeoutId = setTimeout(() => {
        timeoutOccurred = true;
        xhr.abort();
      }, 300000);

      const cleanup = () => {
        clearTimeout(timeoutId);
      };

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(
            (event.loaded / event.total) * 90,
            90
          );

          onProgress(Math.max(5, percent));
        }
      });

      xhr.addEventListener("load", () => {
        cleanup();

        if (xhr.status === 401) {
          handleUnauthorized();
          reject(
            new Error("Your admin session has expired. Please log in again.")
          );
          return;
        }

        let data = {};

        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          reject(new Error("Invalid upload response"));
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject(
            new Error(data.message || `Image upload failed (${xhr.status})`)
          );
          return;
        }

        const imageUrl = data.imageUrl || data.url;

        if (
          !imageUrl ||
          typeof imageUrl !== "string" ||
          !imageUrl.startsWith("https://")
        ) {
          reject(new Error("Upload returned an invalid image URL"));
          return;
        }

        onProgress(100);
        resolve(imageUrl);
      });

      xhr.addEventListener("error", () => {
        cleanup();
        reject(new Error("Network error: Unable to reach the upload server"));
      });

      xhr.addEventListener("abort", () => {
        cleanup();

        if (timeoutOccurred) {
          reject(new Error("Image upload timed out after 5 minutes"));
        } else {
          reject(new Error("Image upload cancelled"));
        }
      });

      xhr.addEventListener("timeout", () => {
        cleanup();
        reject(new Error("Image upload timed out"));
      });

      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  // Fetch-based upload fallback.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Your admin session has expired. Please log in again.");
    }

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Image upload failed");
    }

    const imageUrl = data.imageUrl || data.url;

    if (
      !imageUrl ||
      typeof imageUrl !== "string" ||
      !imageUrl.startsWith("https://")
    ) {
      throw new Error("Upload returned an invalid image URL");
    }

    return imageUrl;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Image upload timed out after 5 minutes");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/* =========================
   IMAGE URL VALIDATION
========================= */

export const ensureImageIsRemote = (image) => {
  if (!image) return true;

  if (typeof image !== "string") {
    return false;
  }

  return image.trim().startsWith("https://");
};
