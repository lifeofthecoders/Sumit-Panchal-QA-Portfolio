import { getBlogsPaginated } from "../services/blogService";
import BlogCard from "../components/BlogCard";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../assets/css/blogs.css";

// ✅ IMPORT animation hook (required)
import usePageAnimations from "../hooks/usePageAnimations";
import Loader from "../components/Loader";

export default function Blogs() {
  usePageAnimations();

  const { hash } = useLocation();

  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ API Error Message
  const [errorMsg, setErrorMsg] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Prevent multiple scroll triggers
  const hasScrolledRef = useRef(false);

  // Load blogs
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const result = await getBlogsPaginated(page, limit);

        setBlogs(Array.isArray(result?.data) ? result.data : []);
        setTotalPages(result?.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to load blogs:", error);

        setBlogs([]);
        setTotalPages(1);

        // ✅ Proper user-friendly error
        setErrorMsg(
          "⚠️ Blogs failed to load. Please refresh the page or try again after a few seconds."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, [page]);

  // ✅ Scroll to top on every page change (important)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // ✅ Reset scroll trigger when hash changes
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [hash]);

  // ✅ Handle scroll to hash section (after page fully loaded + blogs loaded)
  useEffect(() => {
    if (!hash) return;
    if (isLoading) return;

    if (hasScrolledRef.current) return;

    const id = hash.split("#").pop();
    if (!id) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          hasScrolledRef.current = true;
        }
      });
    });
  }, [hash, isLoading]);

  // Anchor icon click handler
  useEffect(() => {
    const anchorIcons = document.querySelectorAll(".anchor-icon");

    const handleAnchorClick = (e) => {
      e.preventDefault();
      const id = e.currentTarget.getAttribute("data-target");
      if (!id) return;

      // ✅ KEEP SAME redirect link format
      const fullURL = `${window.location.origin}${window.location.pathname}#/${id}`;

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

  // ✅ ANIMATION HOOK - SAME AS ABOUT PAGE
  useEffect(() => {
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
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isLoading && <Loader text="Loading blogs..." />}

      <section className="blogs-page">
        <main className="blogs">
          <section className="blogs-container">
            {/* BLOGS */}
            <section
              className="blogs-card"
              style={{
                padding: "40px 40px",
                maxWidth: "1200px",
                margin: "0 auto",
                boxSizing: "border-box",
                width: "100%",
                minHeight: "70vh",
              }}
            >
              <h3
                id="latest-blogs"
                className="latest-blogs-heading heading-link"
                style={{
                  fontSize: "18.72px",
                  fontWeight: "bolder",
                  margin: "20px 20px 20px 0px",
                  textAlign: "left",
                }}
              >
                <b>📚 Latest Blog Posts</b>{" "}
                {/* ✅ DO NOT CHANGE THIS LINK */}
                <a
                  href="/#/blogs/#latest-blogs"
                  className="anchor-icon"
                  data-target="blogs/#latest-blogs"
                >
                  🔗
                </a>
              </h3>

              {/* ✅ Error Message UI */}
              {!isLoading && errorMsg && (
                <div
                  style={{
                    background: "#fff3cd",
                    color: "#856404",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    marginBottom: "25px",
                    fontWeight: "600",
                    textAlign: "center",
                    border: "1px solid #ffeeba",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <div
                className="blogs-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "32px",
                }}
              >
                {!isLoading &&
                  blogs.map((blog) => {
                    const blogId = blog._id || blog.id;
                    return <BlogCard key={blogId} blog={blog} />;
                  })}
              </div>

              {!isLoading && !errorMsg && blogs.length === 0 && (
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

              {/* Pagination */}
              {!isLoading && totalPages >= 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "35px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      background: page === 1 ? "#ccc" : "#4CAF50",
                      color: "#fff",
                      fontWeight: "700",
                      transition: "all 0.25s ease",
                    }}
                  >
                    ◀ Prev
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(
                      Math.max(page - 3, 0),
                      Math.min(page + 2, totalPages)
                    )
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          background: p === page ? "#21C87A" : "#E8F5E9",
                          color: p === page ? "#fff" : "#2E7D32",
                          fontWeight: "800",
                          minWidth: "44px",
                          transition: "all 0.25s ease",
                        }}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      background: page === totalPages ? "#ccc" : "#4CAF50",
                      color: "#fff",
                      fontWeight: "700",
                      transition: "all 0.25s ease",
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </section>
          </section>
        </main>
      </section>
    </>
  );
}
