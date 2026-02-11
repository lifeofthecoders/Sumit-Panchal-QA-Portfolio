import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../services/blogService";
import { useEffect, useState } from "react";
import "../assets/css/blogs.css";
import usePageAnimations from "../hooks/usePageAnimations";

export default function BlogDetail() {
  // Animation hook for header and page animations
  usePageAnimations();

  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);

  /* ✅ Hover state added for Back button */
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      // Scroll to top when blog detail page loads
      window.scrollTo(0, 0);

      try {
        const foundBlog = await getBlogById(id);

        // ✅ FIX: handle empty or invalid response safely
        if (foundBlog && (foundBlog._id || foundBlog.id)) {
          setBlog(foundBlog);
        } else {
          navigate("/blogs");
        }
      } catch (error) {
        console.error("Failed to load blog:", error);
        navigate("/blogs");
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
    <section className="blogs-page">
      <main className="blogs">
        <section className="blogs-container">
          <section className="blogs-card">
            <div
              style={{
                padding: "40px 40px",
                maxWidth: "1200px",
                margin: "0 auto",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              {/* Back Button */}
              <h3
                id="back-button"
                style={{ marginBottom: "20px", color: "#ffffff" }}
              >
                <button
                  onClick={() => navigate("/blogs")}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
                    display: "inline-block",
                    background: isHovering ? "#21C87A" : "#19A25E",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginLeft: "-10px",
                    marginTop: "16px",
                    marginBottom: "16px",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  ← Back to Blogs
                </button>
              </h3>

              {/* Title */}
              <h2 style={{ margin: "20px 20px 20px 0px", fontSize: "18.72px" }}>
                <b>{id ? "👁️📚 View Blog" : "➕📚 Add Blog"}</b>
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
                  fontWeight: "bolder",
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

                <span style={{ fontSize: "14px", color: "#000" }}>
                  {formatDate(blog.date)}
                </span>

                <span style={{ fontSize: "14px", color: "#000" }}>
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
                  color: "#000",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  maxWidth: "100%",
                  textAlign: "justify",
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
                  textAlign: "justify",
                }}
                dangerouslySetInnerHTML={{ __html: blog.description }}
              />

              {/* Content Styling */}
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
                  text-align: justify;
                }

                .blog-content ul, .blog-content ol {
                  margin-left: 30px;
                  margin-bottom: 16px;
                  text-align: justify;
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
                  text-align: justify;
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
          </section>
        </section>
      </main>
    </section>
  );
}
