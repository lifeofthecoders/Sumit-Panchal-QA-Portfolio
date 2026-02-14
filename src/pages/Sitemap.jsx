import { useEffect } from "react";
import Header from "../components/Header";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/sitemap.css";
import "../assets/js/sitemap";
import { Link } from "react-router-dom";

export default function Sitemap() {
  // ✅ Same animation hook as About
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

  return (
    <>
      {/* PAGE CONTENT */}
      <section className="sitemap-page">
        <main className="sitemap">
          <section className="container section-lg bg-gray animate-content">
            <div className="sitemap">

              <h3 id="sitemap" className="heading-link">
                <b>🗺️ Sitemap</b>
                <a href="/#sitemap/#sitemap" className="anchor-icon" data-target="sitemap/#sitemap">🔗</a>
              </h3>

              <div className="sitemap">
                <ul className="sitemap-list">
                  <li><Link to="/">HOME</Link></li>
                  <li><Link to="/about">ABOUT</Link></li>
                  <li><Link to="/services">SERVICES</Link></li>
                  <li><Link to="/projects">PROJECTS</Link></li>
                  <li><Link to="/portfolio">PORTFOLIO</Link></li>
                  <li><Link to="/gallery">GALLERY</Link></li>
                  <li><Link to="/blogs">BLOGS</Link></li>
                  <li><Link to="/contact">CONTACT</Link></li>
                </ul>
              </div>

            </div>
          </section>

        </main>
      </section>
    </>
  );
}
