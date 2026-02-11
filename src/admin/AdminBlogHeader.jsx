import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../assets/css/blogs.css";

export default function AdminBlogHeader() {
  const location = useLocation();

  /* =========================================
     RESET & REPLAY HEADER ANIMATIONS
     ========================================= */
  useEffect(() => {
    const animatedSelectors = [
      ".hero-animate",
      ".profile-slide",
      ".logo-slide"
    ];

    animatedSelectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el) return;

      el.classList.remove("in-view", "animate");
      void el.offsetWidth; // force reflow
      el.classList.add("in-view", "animate");
    });
  }, [location.pathname]);

  return (
    <header className="hero-header blogs-header">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="owner-name logo-link logo-slide">
          <img 
            src="/Sumit-Panchal-QA-Portfolio/image/logo.svg" 
            className="site-logo" 
            alt="Logo" 
          />
        </div>
      </div>

      {/* CENTER TITLE */}
      <div className="hero-title hero-animate">
        <h1>
          <b>Blogs</b>
        </h1>
        <h2>
          <b>
            | Blogs | Thoughts | Experience | Insights | Expertise | Knowledge Sharing |
          </b>
        </h2>
        <div className="title-underline"></div>
      </div>

      {/* PROFILE BADGE */}
      <div className="profile-badge profile-slide">
        <img
          src="/Sumit-Panchal-QA-Portfolio/image/profile.jpg"
          alt="Profile"
        />
        <span className="profile-name">
          <b>Sumit Panchal</b>
        </span>
      </div>
    </header>
  );
}