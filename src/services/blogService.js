// Determine API base URL. Prefer build-time VITE_API_BASE_URL, fallback to runtime detection
// so the GitHub Pages build can still call the deployed backend without rebaking env vars.
const RENDER_BACKEND = "https://sumit-panchal-qa-portfolio.onrender.com";
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

try {
  // If running from GitHub Pages (frontend deployed at lifeofthecoders.github.io),
  // prefer the Render backend URL so uploads don't attempt to contact localhost.
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host.includes("github.io") || host.includes("githubusercontent.com")) {
      API_BASE_URL = RENDER_BACKEND;
    }
  }
} catch (e) {
  // ignore in non-browser environments
}

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
 * ✅ Upload Blog Image (Computer Upload → Cloudinary)
 */
export const uploadBlogImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/blogs/upload`, {
    method: "POST",
    body: formData,
  });

  // ✅ FIX: If response is HTML instead of JSON, don't crash
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(
      "Upload API returned invalid response (not JSON). " +
        "This usually means your VITE_API_BASE_URL is wrong or backend is not running."
    );
  }

  if (!res.ok) {
    throw new Error(data.message || "Image upload failed");
  }

  // ✅ FIX: support both backend response keys
  const url = data.imageUrl || data.url;
  if (!url || (typeof url !== "string") || !(url.startsWith("http://") || url.startsWith("https://"))) {
    throw new Error("Upload succeeded but returned an invalid image URL");
  }

  return url;
};

// Helper to validate image value before saving blog
export const ensureImageIsRemote = (image) => {
  if (!image) return true;
  if (typeof image !== "string") return false;
  const v = image.trim();
  return v.startsWith("http://") || v.startsWith("https://");
};
