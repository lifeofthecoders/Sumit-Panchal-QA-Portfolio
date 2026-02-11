import { useEffect } from "react";
import Header from "../components/Header";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/sitemap.css";
import "../assets/js/sitemap";
import { Link } from "react-router-dom";

export default function Sitemap() {
  // ✅ Same animation hook as About
  usePageAnimations();

  // Optional: scroll to top on route change (About already does this)
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
