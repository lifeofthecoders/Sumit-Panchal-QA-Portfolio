const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
  const res = await fetch(`${API_BASE_URL}/api/blogs?page=${page}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return await res.json();
};

