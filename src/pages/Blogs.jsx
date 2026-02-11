import { getBlogs } from "../services/blogService";
import BlogCard from "../components/BlogCard";
import { useEffect, useState } from "react";
import "../assets/css/blogs.css";
import { Link } from "react-router-dom";

// ✅ IMPORT IMAGE PROPERLY
import home4 from "/image/home4.jpg";

// ✅ IMPORT animation hook (required)
import usePageAnimations from "../hooks/usePageAnimations";

export default function Blogs() {
  // Same animation hook
  usePageAnimations();

  // blogs state
  const [blogs, setBlogs] = useState([]);

  // Load blogs once
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await getBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load blogs:", error);
        setBlogs([]);
      }
    };

    loadBlogs();
  }, []);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);

    const anchorIcons = document.querySelectorAll(".anchor-icon");

    const handleAnchorClick = (e) => {
      e.preventDefault();

      const id = e.currentTarget.getAttribute("data-target");
      if (!id) return;

      // ✅ FIXED: correct format for HashRouter
      const fullURL = `${window.location.origin}${window.location.pathname}#/blogs#${id}`;

      navigator.clipboard.writeText(fullURL);

      e.currentTarget.innerText = "✅";
      e.currentTarget.style.color = "#00c853"; // green

      setTimeout(() => {
        e.currentTarget.innerText = "🔗";
        e.currentTarget.style.color = ""; // reset
      }, 1200);
    };

    anchorIcons.forEach((icon) =>
      icon.addEventListener("click", handleAnchorClick)
    );

    return () => {
      anchorIcons.forEach((icon) =>
        icon.removeEventListener("click", handleAnchorClick)
      );
    };
  }, []);

  return (
    <section className="blogs-page">
      <main className="blogs">
        <section className="blogs-container">
          {/* BLOGS */}
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
              <div>
                <h3
                  id="latest-blogs"
                  className="latest-blogs-heading"
                  style={{
                    fontSize: "18.72px",
                    fontWeight: "bolder",
                    margin: "20px 20px 20px 0px",
                    textAlign: "left",
                  }}
                >
                  <b>📚 Latest Blog Posts</b>{" "}
                  <a
                    href="#latest-blogs"
                    className="anchor-icon"
                    data-target="latest-blogs"
                  >
                    🔗
                  </a>
                </h3>

                <div
                  className="blogs-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "32px",
                  }}
                >
                  {blogs.map((blog) => {
                    const blogId = blog._id || blog.id;
                    return <BlogCard key={blogId} blog={blog} />;
                  })}
                </div>

                {blogs.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "18px",
                      color: "#999",
                      marginTop: "60px",
                    }}
                  >
                    No blogs available yet. Check back soon!
                  </p>
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
    </section>
  );
}
