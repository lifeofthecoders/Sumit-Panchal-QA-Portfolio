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
      <section className="gallery-page">
        <main className="gallery">
          <section className="gallery-container">

            {/* CERTIFICATIONS */}
            <section className="gallery-card">

              <h3 id="certifications" className="heading-link">
                <b>📜 Certifications</b>
                <a href="/#gallery/#certifications" className="anchor-icon" data-target="gallery/#certifications">🔗</a>
              </h3>

              <div className="gallery-grid">
                <div className="gallery-item">
                  <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} alt="Certification" />
                </div>

                <div className="gallery-item">
                  <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} alt="Certification" />
                </div>

                <div className="gallery-item">
                  <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} alt="Certification" />
                </div>
              </div>

            </section>

            {/* WORK SAMPLES */}
            <section className="gallery-card">

              <h3 id="work-samples" className="heading-link">
                <b>📂 Work Samples</b>
                <a href="/#gallery/#work-samples" className="anchor-icon" data-target="gallery/#work-samples">🔗</a>
              </h3>

              <div className="gallery-grid">
                {/* <div className="gallery-item">
                  <img src={home4} alt="Work Sample" />
                </div> */}

                <div className="gallery-item excel-card">
                  <a
                    href={`${import.meta.env.BASE_URL}image/LYMÜV_Test_Cases.xlsx`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="excel-link"
                  >
                    <div className="excel-box">
                      <span className="excel-title">📊 LYMÜV  Test Cases</span>
                      <p className="excel-subtitle">Click to Download ⬇️</p>
                    </div>
                  </a>
                </div>


                {/* <div className="gallery-item">
                  <img
                    src={`${import.meta.env.BASE_URL}image/Appbugs.jpg`}
                    alt="Work Sample"
                  />
                </div> */}

                <div className="gallery-item excel-card">
                  <a
                    href={`${import.meta.env.BASE_URL}image/LYMÜV_Bugs_Documentations.xlsx`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="excel-link"
                  >
                    <div className="excel-box">
                      <span className="excel-title">📊 LYMÜV Bugs Documentation</span>
                      <p className="excel-subtitle">Click to Download ⬇️</p>
                    </div>
                  </a>
                </div>

                {/* <div className="gallery-item">
                  <img
                    src={`${import.meta.env.BASE_URL}image/Admin_Panel_Bugs.jpg`}
                    alt="Work Sample"
                  />
                </div> */}

                <div className="gallery-item excel-card">
                  <a
                    href={`${import.meta.env.BASE_URL}image/DapMe.xlsx`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="excel-link"
                  >
                    <div className="excel-box">
                      <span className="excel-title">📊 DapMe Documentation</span>
                      <p className="excel-subtitle">Click to Download ⬇️</p>
                    </div>
                  </a>
                </div>
              </div>

            </section>

            {/* PROFESSIONAL HIGHLIGHTS */}
            <section className="gallery-card">

              <h3 id="professional-highlights" className="heading-link">
                <b>✨ Professional Highlights</b>
                <a href="/#gallery/#professional-highlights" className="anchor-icon" data-target="gallery/#professional-highlights">🔗</a>
              </h3>

              <div className="gallery-grid">
                <div className="gallery-item">
                  <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} alt="Highlight" />
                </div>

                <div className="gallery-item">
                  <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} alt="Highlight" />
                </div>

                <div className="gallery-item">
                  <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} alt="Highlight" />
                </div>
              </div>

            </section>

          </section>
        </main>
      </section>
    </>
  );
}
