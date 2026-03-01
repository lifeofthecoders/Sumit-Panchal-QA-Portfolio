import "../assets/css/blogs.css";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Check if user is logged in (based on your login logic)
  const isLoggedIn = !!localStorage.getItem("admin-just-logged-in");

  // Helper to check active route
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/blogs") return location.pathname.startsWith("/blogs");
    return location.pathname === path;
  };

  // Reset & replay header animations on route change
  useEffect(() => {
    const animatedSelectors = [".hero-animate", ".profile-slide", ".logo-slide"];

    animatedSelectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el) return;

      el.classList.remove("in-view", "animate");
      void el.offsetWidth; // force reflow
      el.classList.add("in-view", "animate");
    });
  }, [location.pathname]);

  // Navigation items (ADMIN conditionally shown only when NOT logged in)
  const navItems = [
    { label: "HOME", path: "/" },
    { label: "ABOUT", path: "/about" },
    { label: "SERVICES", path: "/services" },
    { label: "PROJECTS", path: "/projects" },
    { label: "PORTFOLIO", path: "/portfolio" },
    { label: "GALLERY", path: "/gallery" },
    { label: "BLOGS", path: "/blogs" },
    { label: "CONTACT", path: "/contact" },
    { label: "SITEMAP", path: "/sitemap" },
    // Show "ADMIN" only if NOT logged in
    ...( !isLoggedIn ? [{ label: "ADMIN", path: "/admin/login" }] : []),
  ];

  // Optional: If you want to show "Dashboard" AFTER login instead of hiding ADMIN
  // Uncomment this block and comment out the line above
  /*
  ...( isLoggedIn 
    ? [{ label: "DASHBOARD", path: "/admin" }] 
    : [{ label: "ADMIN", path: "/admin/login" }]
  ),
  */

  return (
    <header
      className={`hero-header ${location.pathname === "/" ? "home-header" : ""}`}
    >
      {/* TOP BAR */}
      <div className="top-bar">
        <NavLink
          to="/"
          className="owner-name logo-link logo-slide"
          onClick={() => setOpen(false)}
        >
          <img
            src={`${import.meta.env.BASE_URL}image/logo.svg`}
            className="site-logo"
            alt="Sumit Panchal - QA Portfolio Logo"
          />
        </NavLink>

        <input
          type="checkbox"
          id="menu-toggle"
          checked={open}
          onChange={() => setOpen(!open)}
        />
        <label htmlFor="menu-toggle" className="hamburger" />

        <nav className="nav-links nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* CENTER TITLE – conditional based on route */}
      <div
        key={`title-${location.pathname}`}
        className="hero-title hero-animate"
      >
        {location.pathname === "/about" ? (
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
        ) : location.pathname === "/services" ? (
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
        ) : location.pathname === "/projects" ? (
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
        ) : location.pathname === "/portfolio" ? (
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
        ) : location.pathname.startsWith("/gallery") ? (
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
        ) : location.pathname.startsWith("/blogs") ? (
          <>
            <h1>
              <b>Blogs</b>
            </h1>
            <h2>
              <b>
                | Insights | Experience | Knowledge Sharing | Best Practices | Testing Tips | Industry Updates |
              </b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : location.pathname === "/contact" ? (
          <>
            <h1>
              <b>Contact</b>
            </h1>
            <h2>
              <b>| Let's Collaborate | QA Opportunities | Get in Touch |</b>
            </h2>
            <div className="title-underline"></div>
          </>
        ) : location.pathname === "/sitemap" ? (
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