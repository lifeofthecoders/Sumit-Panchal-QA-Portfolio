import "../assets/css/blogs.css";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";
  const isServices = location.pathname === "/services";
  const isProjects = location.pathname === "/projects";
  const isPortfolio = location.pathname === "/portfolio";
  const isGallery = location.pathname === "/gallery";

  /* ✅ FIX — Covers /blogs AND /blogs/:id */
  const isBlogs =
    location.pathname === "/blogs" ||
    location.pathname.startsWith("/blogs/");

  const isContact = location.pathname === "/contact";
  const isSitemap = location.pathname === "/sitemap";


  /* =========================================
     RESET & REPLAY HEADER ANIMATIONS (SAFE)
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
    <header
      className={`hero-header ${isHome
        ? "home-header"
        : isAbout
          ? "about-header"
          : isServices
            ? "services-header"
            : isProjects
              ? "projects-header"
              : isPortfolio
                ? "portfolio-header"
                : isGallery
                  ? "gallery-header"
                  : isBlogs
                    ? "blogs-header"
                    : isContact
                      ? "contact-header"
                      : isSitemap
                        ? "sitemap-header"
                        : ""
        }`}
    >
      {/* TOP BAR */}
      <div className="top-bar">
        <NavLink
          to="/"
          className="owner-name logo-link logo-slide"
          onClick={() => setOpen(false)}
        >
          <img src="/Sumit-Panchal-QA-Portfolio/image/logo.svg" className="site-logo" alt="Logo" />
        </NavLink>

        <input
          type="checkbox"
          id="menu-toggle"
          checked={open}
          onChange={() => setOpen(!open)}
        />
        <label htmlFor="menu-toggle" className="hamburger" />

        <nav className="nav-links nav">
          {[
            "HOME",
            "ABOUT",
            "SERVICES",
            "PROJECTS",
            "PORTFOLIO",
            "GALLERY",
            "BLOGS",
            "CONTACT",
            "SITEMAP",
          ].map((item) => (
            <NavLink
              key={item}
              to={item === "HOME" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {item}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* CENTER TITLE */}
      <div
        key={`title-${location.pathname}`}
        className="hero-title hero-animate"
      >
        {isAbout ? (
          <>
            <h1>
              <b>About</b>
            </h1>
            <h2>
              <b>
                | QA Professional | SDLC & STLC | Defect Lifecycle | Agile Teams |
                4+ Years Experience | Quality-Driven & Detail-Oriented |
              </b>
            </h2>
          </>
        ) : isServices ? (
          <>
            <h1>
              <b>Services</b>
            </h1>
            <h2>
              <b>
                | Functional Testing | Regression & Re-testing | Black Box
                Testing | Smoke & Sanity Testing |
              </b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : isProjects ? (
          <>
            <h1>
              <b>Projects</b>
            </h1>
            <h2>
              <b>
                | Real-World QA Projects | End-to-End Testing | Functional &
                Regression Testing | Domain-Driven Applications |
              </b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : isPortfolio ? (
          <>
            <h1>
              <b>Portfolio</b>
            </h1>
            <h2>
              <b>
                | Manual & UAT Testing | SDLC & STLC | Defect Lifecycle | Agile
                Methodology | Web & Mobile Applications | 4+ Years Experience |
              </b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : isGallery ? (
          <>
            <h1>
              <b>Gallery</b>
            </h1>
            <h2>
              <b>
                | Certifications | Work Samples | Professional Highlights |
              </b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : isBlogs ? (
          <>
            <h1>
              <b>Blogs</b>
            </h1>
            <h2>
              <b>
                | Blogs | Thoughts | Experience | Insights | Expertise | Knowledge Sharing |
              </b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : isContact ? (
          <>
            <h1>
              <b>Contact</b>
            </h1>
            <h2>
              <b>| Let's Collaborate | QA Opportunities | Get in Touch |</b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : isSitemap ? (
          <>
            <h1>
              <b>Sitemap</b>
            </h1>
            <h2>
              <b>| Complete Site Navigation | Quick Access |</b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : (
          <>
            <h1>
              <b>Sumit Panchal</b>
            </h1>
            <h2>
              <b>| Quality Analyst Engineer |</b>
            </h2>
          </>
        )}
      </div>

      {/* PROFILE BADGE */}
      <div
        key={`profile-${location.pathname}`}
        className="profile-badge profile-slide"
      >
        <img
          src={`${import.meta.env.BASE_URL}image/profile.jpg`}
          alt="Profile"
        />
        <span className="profile-name">
          <b>Sumit Panchal</b>
        </span>
      </div>
    </header>
  );
}
