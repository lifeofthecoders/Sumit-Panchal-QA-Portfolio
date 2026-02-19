import { useParams, useNavigate } from "react-router-dom";
import { getBlogById } from "../services/blogService";
import { useEffect, useState } from "react";
import "../assets/css/blogs.css";
import usePageAnimations from "../hooks/usePageAnimations";
import Loader from "../components/Loader";

export default function BlogDetail() {
  usePageAnimations();

  // ✅ ANIMATION HOOK - OPTIMIZED FOR SMOOTH SCROLL
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
       LOGO RE-ANIMATION (SMOOTH)
       ============================ */
    const logo = document.querySelector(".logo-slide");
    let lastScrollY = window.scrollY;
    let animationFrameId = null;

    const restartLogoAnimation = () => {
      if (!logo) return;
      logo.classList.remove("animate");
      void logo.offsetWidth;
      logo.classList.add("animate");
    };

    restartLogoAnimation();

    const handleScrollOptimized = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollY) > 15) {
          restartLogoAnimation();
          lastScrollY = currentScroll;
        }
      });
    };

    window.addEventListener("scroll", handleScrollOptimized, { passive: true });

    /* ============================
       CLEANUP (CRITICAL)
       ============================ */
    return () => {
      anchorIcons.forEach((icon) =>
        icon.removeEventListener("click", handleAnchorClick)
      );
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollOptimized);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Error state
  const [error, setError] = useState("");

  /* ✅ Hover state added for Back button */
  const [isHovering, setIsHovering] = useState(false);

  // Hover for error buttons
  const [retryHover, setRetryHover] = useState(false);
  const [backHover, setBackHover] = useState(false);

  const loadBlog = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Scroll to top when blog detail page loads
      window.scrollTo(0, 0);

      const foundBlog = await getBlogById(id);

      if (foundBlog) {
        setBlog(foundBlog);
      } else {
        // If blog not found
        setError("⚠️ Blog not found. It may have been deleted.");
      }
    } catch (err) {
      console.error("Failed to load blog detail:", err);

      // ✅ Friendly message
      setError(
        "❌ Unable to load this blog right now. Please check your internet connection or try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ======================================================
     ✅ NEW FEATURE: AUTO-GENERATE IDs FOR HEADINGS
     + FIXED TOC SCROLLING FOR HASH ROUTER
     ====================================================== */
  useEffect(() => {
    if (!blog) return;

    let cleanupTOC = null;

    const timer = setTimeout(() => {
      const content = document.querySelector(".blog-content");
      if (!content) return;

      // Find headings inside blog content
      const headings = content.querySelectorAll("h1, h2, h3");

      headings.forEach((heading) => {
        // If already has id, skip
        if (heading.id) return;

        // Generate slug from heading text
        const slug = heading.innerText
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "") // remove special chars
          .replace(/\s+/g, "-"); // spaces -> hyphen

        heading.id = slug;
      });

      /* ======================================================
         ✅ FIX: Scroll using ?section= (NOT #hash)
         ====================================================== */
      const params = new URLSearchParams(window.location.search);
      const section = params.get("section");

      if (section) {
        const targetEl = document.getElementById(section);

        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      /* ======================================================
         ✅ FIX: Prevent page reload / new tab when clicking TOC
         ====================================================== */
      const handleTOCClick = (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href) return;

        // Only handle ?section= links
        if (href.startsWith("?section=")) {
          e.preventDefault();

          const sectionId = href.replace("?section=", "").trim();

          // Update URL without reload
          window.history.replaceState(null, "", `?section=${sectionId}`);

          // Scroll
          const targetEl = document.getElementById(sectionId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      };

      content.addEventListener("click", handleTOCClick);

      cleanupTOC = () => {
        content.removeEventListener("click", handleTOCClick);
      };
    }, 250);

    return () => {
      clearTimeout(timer);
      if (cleanupTOC) cleanupTOC();
    };
  }, [blog]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <>
      {isLoading && <Loader text="Loading blog..." />}

      {/* ✅ ERROR UI */}
      {!isLoading && error && (
        <section className="blogs-page">
          <main className="blogs">
            <section className="blogs-container">
              <section className="blogs-card">
                <div
                  style={{
                    padding: "40px 40px",
                    maxWidth: "900px",
                    margin: "0 auto",
                    boxSizing: "border-box",
                    width: "100%",
                    minHeight: "70vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <h2 style={{ fontSize: "22px", fontWeight: "800" }}>
                    Something went wrong
                  </h2>

                  <p
                    style={{
                      marginTop: "15px",
                      fontSize: "16px",
                      color: "#f44336",
                      fontWeight: "600",
                    }}
                  >
                    {error}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "12px",
                      marginTop: "30px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={loadBlog}
                      onMouseEnter={() => setRetryHover(true)}
                      onMouseLeave={() => setRetryHover(false)}
                      style={{
                        padding: "12px 22px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "700",
                        background: retryHover ? "#21C87A" : "#4CAF50",
                        color: "#fff",
                        transition: "all 0.25s ease",
                      }}
                    >
                      🔄 Try Again
                    </button>

                    <button
                      onClick={() => navigate("/blogs")}
                      onMouseEnter={() => setBackHover(true)}
                      onMouseLeave={() => setBackHover(false)}
                      style={{
                        padding: "12px 22px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "700",
                        background: backHover ? "#1565C0" : "#2196F3",
                        color: "#fff",
                        transition: "all 0.25s ease",
                      }}
                    >
                      ← Back to Blogs
                    </button>
                  </div>
                </div>
              </section>
            </section>
          </main>
        </section>
      )}

      {/* ✅ BLOG UI */}
      {!isLoading && blog && (
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
                  <h2
                    style={{
                      margin: "20px 20px 20px 0px",
                      fontSize: "18.72px",
                    }}
                  >
                    <b>👁️📚 View Blog</b>
                  </h2>

                  {/* ✅ Blog Image (Cloudinary Safe + Never Break) */}
                  <img
                    src={blog.image || "/image/default-blog.jpg"}
                    alt={blog.title}
                    onError={(e) => {
                      e.currentTarget.src = "/image/default-blog.jpg";
                    }}
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
                      By{" "}
                      <strong style={{ color: "#4caf50" }}>
                        {blog.author}
                      </strong>{" "}
                      • {blog.profession}
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
                      scroll-margin-top: 90px;
                    }
                    .blog-content h1 { font-size: 36px; }
                    .blog-content h2 { font-size: 30px; }
                    .blog-content h3 { font-size: 24px; }

                    .blog-content p {
                      margin-bottom: 16px;
                      margin-left:  30px;
                      text-align: justify;
                    }

                    /* =========================================================
                    ✅ QUILL LIST ALIGNMENT FIX (100% SAME AS ADMIN EDITOR)
                    Tight spacing + Proper Indent levels
                    ========================================================= */

                    /* Base list style */
                    .blog-content ul,
                    .blog-content ol {
                      margin: 10px 0 18px 0;
                      padding-left: 22px; /* ✅ reduced so bullet comes closer */
                      list-style-position: outside;
                    }

                    /* ✅ remove extra spacing inside list items */
                    .blog-content li {
                      margin: 6px 0;
                      line-height: 1.75;
                      margin-left: 40px !important;
                      padding-left: 0px !important;
                    }

                    /* ✅ This is the MAIN FIX: bullet + text spacing */
                    .blog-content li::marker {
                      font-size: 1em;
                    }

                    /* ✅ Quill sometimes wraps list item text inside <p> */
                    .blog-content li p {
                      margin: 0 !important;
                      display: inline;
                    }

                    /* Base list item */
                    .blog-content li {
                      margin: 6px 0;
                      line-height: 1.75;
                    }

                    /* Nested list spacing */
                    .blog-content ul ul,
                    .blog-content ol ol,
                    .blog-content ul ol,
                    .blog-content ol ul {
                      margin-top: 8px;
                      margin-bottom: 8px;
                      padding-left: 26px;
                    }

                    /* ✅ QUILL INDENT LEVELS (Very Important) */
                    .blog-content .ql-indent-1 { padding-left: 30px !important; }
                    .blog-content .ql-indent-2 { padding-left: 60px !important; }
                    .blog-content .ql-indent-3 { padding-left: 90px !important; }
                    .blog-content .ql-indent-4 { padding-left: 120px !important; }
                    .blog-content .ql-indent-5 { padding-left: 150px !important; }
                    .blog-content .ql-indent-6 { padding-left: 180px !important; }
                    .blog-content .ql-indent-7 { padding-left: 210px !important; }
                    .blog-content .ql-indent-8 { padding-left: 240px !important; }

                  `}</style>
                </div>
              </section>
            </section>
          </main>
        </section>
      )}
    </>
  );
}
