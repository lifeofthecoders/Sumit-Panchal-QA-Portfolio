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

  // ✅ blogs state (was missing)
  const [blogs, setBlogs] = useState([]);

  // Load blogs once
  useEffect(() => {
    const data = getBlogs();
    setBlogs(data);
  }, []);

  // Scroll to top + anchor copy logic
  useEffect(() => {
    window.scrollTo(0, 0);

    const anchorIcons = document.querySelectorAll(".anchor-icon");

    const handleAnchorClick = (e) => {
      e.preventDefault();
      const id = e.currentTarget.getAttribute("data-target");
      if (!id) return;

      const fullURL =
        window.location.origin + window.location.pathname + "#" + id;

      navigator.clipboard.writeText(fullURL);

      e.currentTarget.innerText = "✅";
      setTimeout(() => {
        e.currentTarget.innerText = "🔗";
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

  // ✅ SINGLE valid return
  return (
    <div style={{ padding: "60px 40px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "800",
          marginBottom: "50px",
          textAlign: "center",
        }}
      >
        Latest Blog Posts
      </h1>

      <div
        className="blogs-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "32px",
        }}
      >
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
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
  );
}
