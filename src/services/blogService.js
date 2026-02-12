// src/services/blogService.js

/**
 * IMPORTANT:
 * - Local:  http://localhost:5000
 * - Live:   use VITE_API_BASE_URL in GitHub Pages build
 *
 * Example:
 * VITE_API_BASE_URL=https://your-backend.onrender.com
 */

// ✅ FIX: Default should be LIVE backend, not localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://sumit-panchal-qa-portfolio.onrender.com";

/**
 * Helper to handle API errors cleanly
 */
const handleResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";

  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
};

/**
 * GET all blogs (latest first)
 */
export const getBlogs = async () => {
  const res = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: "GET",
  });

  const data = await handleResponse(res);

  // ✅ FIX: Always return array (prevents admin/blogs crash)
  return Array.isArray(data) ? data : [];
};

/**
 * GET single blog
 */
export const getBlogById = async (id) => {
  if (!id) return null;

  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "GET",
  });

  if (!res.ok) return null;
  return await handleResponse(res);
};

/**
 * Create or Update blog
 */
export const saveBlog = async (blog) => {
  if (!blog) throw new Error("Blog data is required");

  // ✅ FIX: Support MongoDB _id and old id both
  const blogId = blog?._id || blog?.id;

  // Update
  if (blogId) {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });

    return await handleResponse(res);
  }

  // Create
  const payload = { ...blog };
  delete payload.id;
  delete payload._id;

  const res = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return await handleResponse(res);
};

/**
 * Delete blog
 */
export const deleteBlog = async (id) => {
  if (!id) throw new Error("Blog id is required");

  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "DELETE",
  });

  await handleResponse(res);
  return true;
};
