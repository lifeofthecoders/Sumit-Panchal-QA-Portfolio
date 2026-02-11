import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../services/blogService";
import { useEffect, useState } from "react";
import AdminBlogHeader from "./AdminBlogHeader";

export default function BlogView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  /* ✅ Hover state added */
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
    const foundBlog = await getBlogById(id);
    if (foundBlog) {
      setBlog(foundBlog);
    } else {
      navigate("/admin/blogs");
    }
      };

    loadBlog();
  }, [id, navigate]);

  if (!blog) return <div>Loading...</div>;

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <>
      <AdminBlogHeader />

      <div
        style={{
          minHeight: "calc(100vh - 160px)", // header + footer adjust
          padding: "40px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",

          /* ✅ FIXED — replaced blogs with blog */
          justifyContent: !blog ? "center" : "flex-start",
        }}
      >

        {/* Back Button — Hover Enhanced */}
        <button
          onClick={() => navigate("/admin/blogs")}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            padding: "16px 24px",
            backgroundColor: isHovering ? "#21C87A" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            width: "fit-content",   // prevents full width stretch
          }}
        >
          ← Back to Blog List
        </button>

        {/* Title */}
        <h2 style={{ margin: "20px 20px 20px 0px", fontSize: "18.72px" }}>
          <b>👁️📚 View Blog</b>
        </h2>

        {/* Blog Image */}
        <img
          src={blog.image}
          alt={blog.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "16px",
            marginBottom: "32px",
          }}
        />

        {/* Blog Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "8px 16px",
              backgroundColor: "#6366f1",
              color: "white",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
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
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "800",
            marginBottom: "24px",
            lineHeight: "1.2",
          }}
        >
          {blog.title}
        </h1>

        {/* Blog Content */}
        <div
          className="blog-content"
          style={{
            fontSize: "18px",
            lineHeight: "1.8",
            color: "#333",
          }}
          dangerouslySetInnerHTML={{ __html: blog.description }}
        />

        {/* CSS */}
        <style>{`
          .blog-content h1, .blog-content h2, .blog-content h3 {
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 700;
          }
          .blog-content h1 { font-size: 36px; }
          .blog-content h2 { font-size: 30px; }
          .blog-content h3 { font-size: 24px; }
          .blog-content p { margin-bottom: 16px; }
          .blog-content ul, .blog-content ol {
            margin-left: 30px;
            margin-bottom: 16px;
          }
          .blog-content li { margin-bottom: 8px; }
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
    </>
  );
}
