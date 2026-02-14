import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBlogById, saveBlog } from "../services/blogService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AdminBlogHeader from "./AdminBlogHeader";
import usePageAnimations from "../hooks/usePageAnimations";

export default function BlogForm() {
  usePageAnimations();

  // ✅ ANIMATION HOOK - SAME AS ABOUT PAGE
  useEffect(() => {
    /* ============================
       ANCHOR ICON COPY LINK
       ============================ */
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

    /* ============================
       INTERSECTION OBSERVER
       ============================ */
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      ".slide-up, .hero-animate h1, .hero-animate h2, .profile-slide, .animate-content"
    );

    animatedElements.forEach((el) => observer.observe(el));

    /* ============================
       LOGO RE-ANIMATION
       ============================ */
    const logo = document.querySelector(".logo-slide");
    let lastScrollY = window.scrollY;

    const restartLogoAnimation = () => {
      if (!logo) return;
      logo.classList.remove("animate");
      void logo.offsetWidth;
      logo.classList.add("animate");
    };

    restartLogoAnimation();

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (Math.abs(currentScroll - lastScrollY) > 12) {
        restartLogoAnimation();
        lastScrollY = currentScroll;
      }
    };

    window.addEventListener("scroll", handleScroll);

    /* ============================
       CLEANUP (CRITICAL)
       ============================ */
    return () => {
      anchorIcons.forEach((icon) =>
        icon.removeEventListener("click", handleAnchorClick)
      );
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ Local date (YYYY-MM-DD) - works with input type="date"
  const getTodayLocalYYYYMMDD = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    image: "",
    type: "",
    author: "",
    profession: "",
    date: getTodayLocalYYYYMMDD(),
    title: "",
    description: "",
  });

  /* ✅ Existing hover states */
  const [publishHover, setPublishHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  /* ✅ NEW Back button hover */
  const [backHover, setBackHover] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      if (id) {
        const blog = await getBlogById(id);
        if (blog) {
          // Map Mongo _id to id if needed
          const normalized = { ...blog, id: blog.id || blog._id };
          setFormData(normalized);
        }
      }
    };

    loadBlog();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainText = formData.description.replace(/<[^>]*>/g, "");
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;

    if (wordCount > 10000) {
      alert("Description exceeds 10,000 words limit!");
      return;
    }

    await saveBlog({ ...formData, id: id || undefined });
    navigate("/admin/blogs");
  };

  const plainText = formData.description.replace(/<[^>]*>/g, "");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "blockquote",
    "code-block",
  ];

  return (
    <>
      <AdminBlogHeader />

      <div
        style={{
          minHeight: "calc(100vh - 160px)",
          padding: "40px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* ✅ Back Button */}
        <button
          onClick={() => navigate("/admin/blogs")}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            padding: "16px 24px",
            backgroundColor: backHover ? "#21C87A" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            width: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          ← Back to Blog List
        </button>

        <h2 style={{ margin: "20px 20px 20px 0px", fontSize: "18.72px" }}>
          <b>{id ? "✏️📚 Edit Blog" : "➕📚 Add New Blog"}</b>
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Blog Image URL */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Image URL</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                style={{
                  marginTop: "10px",
                  maxWidth: "200px",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>

          {/* Blog Type */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Type</b> <span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Blog Type</option>
              <option value="Testing">Testing</option>
              <option value="Manual Testing">Manual Testing</option>
              <option value="Automation Testing">Automation Testing</option>
              <option value="Software Testing">Software Testing</option>
              <option value="Performance Testing">Performance Testing</option>
              <option value="Selenium">Selenium</option>
              <option value="Innovation">Innovation</option>
              <option value="Frameworks">Frameworks</option>
              <option value="Education">Education</option>
              <option value="AI">AI</option>
              <option value="DevOps">DevOps</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Author */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Author Name</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author Name"
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Profession */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Author's Profession</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Author's Profession"
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Date */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b> Publish Date</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Title</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Blog Title"
              required
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Description</b> <span style={{ color: "red" }}>*</span> (Max 10,000 words)
            </label>

            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={modules}
              formats={formats}
              placeholder="Write your blog content here..."
              style={{
                backgroundColor: "white",
                minHeight: "400px",
                marginBottom: "10px",
              }}
            />

            <p
              style={{
                fontSize: "12px",
                color: wordCount > 10000 ? "red" : "#666",
                marginTop: "revert-layer",
              }}
            >
              Word Count: {wordCount} / 10,000
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button
              type="submit"
              onMouseEnter={() => setPublishHover(true)}
              onMouseLeave={() => setPublishHover(false)}
              style={{
                padding: "16px 30px",
                fontSize: "16px",
                backgroundColor: publishHover ? "#21C87A" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              {id ? "Update Blog" : "Publish Blog"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/blogs")}
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
              style={{
                padding: "16px 30px",
                fontSize: "16px",
                backgroundColor: cancelHover ? "#ff5c5c" : "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
