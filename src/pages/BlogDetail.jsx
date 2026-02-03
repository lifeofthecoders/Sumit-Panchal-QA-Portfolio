import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../services/blogService";
import { useEffect, useState } from "react";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const foundBlog = getBlogById(id);
    if (foundBlog) {
      setBlog(foundBlog);
    } else {
      navigate("/blogs");
    }
  }, [id, navigate]);

  if (!blog) return <div>Loading...</div>;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div style={{ padding: "60px 40px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/blogs")}
        style={{
          padding: "10px 20px",
          marginBottom: "30px",
          backgroundColor: "#f0f0f0",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600"
        }}
      >
        ← Back to Blogs
      </button>

      {/* Blog Image */}
      <img
        src={blog.image}
        alt={blog.title}
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          borderRadius: "16px",
          marginBottom: "32px"
        }}
      />

      {/* Blog Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
        <span
          style={{
            padding: "8px 16px",
            backgroundColor: "#6366f1",
            color: "white",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600"
          }}
        >
          {blog.type}
        </span>
        <span style={{ fontSize: "14px", color: "#666" }}>
          {formatDate(blog.date)}
        </span>
        <span style={{ fontSize: "14px", color: "#666" }}>
          By <strong>{blog.author}</strong> • {blog.profession}
        </span>
      </div>

      {/* Blog Title */}
      <h1 style={{ fontSize: "48px", fontWeight: "800", marginBottom: "24px", lineHeight: "1.2" }}>
        {blog.title}
      </h1>

      {/* Blog Content - Render HTML */}
      <div
        className="blog-content"
        style={{
          fontSize: "18px",
          lineHeight: "1.8",
          color: "#333"
        }}
        dangerouslySetInnerHTML={{ __html: blog.description }}
      />

      {/* Add CSS for blog content styling */}
      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3 {
          margin-top: 30px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .blog-content h1 { font-size: 36px; }
        .blog-content h2 { font-size: 30px; }
        .blog-content h3 { font-size: 24px; }
        .blog-content p {
          margin-bottom: 16px;
        }
        .blog-content ul, .blog-content ol {
          margin-left: 30px;
          margin-bottom: 16px;
        }
        .blog-content li {
          margin-bottom: 8px;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }
        .blog-content blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 20px;
          margin: 20px 0;
          font-style: italic;
          color: #555;
        }
        .blog-content code {
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
        .blog-content pre {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 20px 0;
        }
        .blog-content a {
          color: #6366f1;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}