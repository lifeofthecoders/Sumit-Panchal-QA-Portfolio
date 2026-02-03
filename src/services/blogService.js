import { v4 as uuid } from "uuid";

const STORAGE_KEY = "qa_blogs";

export const getBlogs = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

export const getBlogById = (id) => {
  const blogs = getBlogs();
  return blogs.find((b) => b.id === id);
};

export const saveBlog = (blog) => {
  const blogs = getBlogs();
  
  if (blog.id) {
    // Update existing
    const index = blogs.findIndex((b) => b.id === blog.id);
    if (index !== -1) {
      blogs[index] = blog;
    }
  } else {
    // Add new
    blog.id = Date.now().toString();
    blogs.push(blog);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
};

export const deleteBlog = (id) => {
  const blogs = getBlogs();
  const filtered = blogs.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
