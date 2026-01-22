import { useEffect } from "react";
import Header from "../components/Header";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/gallery.css";
import "../assets/js/gallery";

// ✅ IMPORT IMAGE PROPERLY
import home4 from "/image/home4.jpg";

export default function Gallery() {
  // Same animation hook
  usePageAnimations();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* PAGE CONTENT */}
      <section className="gallery-page">
        <main className="gallery">
          <section className="gallery-container">

            {/* CERTIFICATIONS */}
            <section className="gallery-card">

              <h3 id="certifications" className="heading-link">
                <b>📜 Certifications</b>
                <span className="anchor-icon" data-target="certifications">🔗</span>
              </h3>

              <div className="gallery-grid">
                <div className="gallery-item">
                  <img src={home4} alt="Certification" />
                </div>

                <div className="gallery-item">
                  <img src={home4} alt="Certification" />
                </div>

                <div className="gallery-item">
                  <img src={home4} alt="Certification" />
                </div>
              </div>

            </section>

            {/* WORK SAMPLES */}
            <section className="gallery-card">

              <h3 id="work-samples" className="heading-link">
                <b>📂 Work Samples</b>
                <span className="anchor-icon" data-target="work-samples">🔗</span>
              </h3>

              <div className="gallery-grid">
                <div className="gallery-item">
                  <img src={home4} alt="Work Sample" />
                </div>

                <div className="gallery-item">
                  <img src={home4} alt="Work Sample" />
                </div>

                <div className="gallery-item">
                  <img src={home4} alt="Work Sample" />
                </div>
              </div>

            </section>

            {/* PROFESSIONAL HIGHLIGHTS */}
            <section className="gallery-card">

              <h3 id="professional-highlights" className="heading-link">
                <b>✨ Professional Highlights</b>
                <span className="anchor-icon" data-target="professional-highlights">🔗</span>
              </h3>

              <div className="gallery-grid">
                <div className="gallery-item">
                  <img src={home4} alt="Highlight" />
                </div>

                <div className="gallery-item">
                  <img src={home4} alt="Highlight" />
                </div>

                <div className="gallery-item">
                  <img src={home4} alt="Highlight" />
                </div>
              </div>

            </section>

          </section>
        </main>
      </section>
    </>
  );
}
