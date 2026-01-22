import { useEffect } from "react";
import Header from "../components/Header";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/sitemap.css";
import "../assets/js/sitemap";

export default function Sitemap() {
  // ✅ Same animation hook as About
  usePageAnimations();

  // Optional: scroll to top on route change (About already does this)
  useEffect(() => {
    window.scrollTo(0, 0);
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
                <span className="anchor-icon" data-target="sitemap">🔗</span>
              </h3>

              <div className="sitemap">
                <ul className="sitemap-list">
                  <li><a href="/">HOME</a></li>
                  <li><a href="/about">ABOUT</a></li>
                  <li><a href="/services">SERVICES</a></li>
                  <li><a href="/projects">PROJECTS</a></li>
                  <li><a href="/portfolio">PORTFOLIO</a></li>
                  <li><a href="/gallery">GALLERY</a></li>
                  <li><a href="/contact">CONTACT</a></li>
                </ul>
              </div>

            </div>
          </section>

        </main>
      </section>
    </>
  );
}
