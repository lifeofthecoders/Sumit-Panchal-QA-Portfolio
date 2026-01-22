import { useEffect } from "react";
import Header from "../components/Header";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/contact.css";
import "../assets/js/contact";

// ✅ IMPORT LINKEDIN ICON PROPERLY
import linkedinIcon from "/image/linkedin.svg";

export default function Contact() {

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
          <section className="container section-lg animate-content">

            {/* LET'S CONNECT */}
            <section className="contact-card">
              <div className="Lets Connect">
                <h3 id="contact" className="heading-link">
                  <b>🤝 Let’s Connect</b>
                  <a
                    href="#contact"
                    className="anchor-icon"
                    data-target="contact"
                    title="Copy link"
                  >
                    🔗
                  </a>
                </h3>

                <h4><b>(Collaboration & Communication)</b></h4>

                <p className="text">
                  Whether you are building a new product or strengthening an existing one, I would be glad to support your
                  quality assurance efforts and help ensure reliable, user-focused software delivery.
                </p>

                <p className="text">
                  If you are looking for a <b>Manual QA Engineer</b> who can take ownership of test planning, execution, and
                  coordination across <b>web and mobile applications</b>, feel free to reach out.
                </p>

                <p className="text">
                  I am open to opportunities with <b>product-based companies, startups, and service organizations</b> that
                  <b> value quality, reliability, and a strong end-user experience.</b>
                </p>
              </div>
            </section>

            <hr className="view-line" />

            {/* RESUME SECTION */}
            <section className="contact-card">
              <div className="Resume-section">
                <h3 id="resume" className="heading-link">
                  <b>📑 Resume</b>
                </h3>

                <p className="section-subtitle">
                  Download my latest resume to review my complete professional summary, tools, skills,
                  and detailed QA project experience.
                </p>

                <a
                  href="/resume/Sumit_Panchal_QA_Resume.pdf"
                  className="btn-primary"
                  download="Sumit_Panchal_QA_Resume.pdf"
                >
                  <b>Download Resume (PDF)</b>
                </a>
              </div>
            </section>

            <hr className="view-line" />

            {/* CONTACT INFO */}
            <section className="contact-card">
              <div className="contact-info">

                {/* EMAIL */}
                <div className="contact-row">
                  <span className="contact-label"><b>Email</b></span>
                  <span className="contact-icon">📧</span>
                  <span className="contact-separator">-</span>
                  <span className="contact-value">
                    <a href="mailto:sumitpanchal5225@gmail.com">
                      <b>sumitpanchal5225@gmail.com</b>
                    </a>
                  </span>
                </div>

                {/* LINKEDIN */}
                <div className="contact-row">
                  <span className="contact-label"><b>LinkedIn</b></span>
                  <span className="contact-icon">
                    <img src={linkedinIcon} className="icon" alt="LinkedIn" />
                  </span>
                  <span className="contact-separator">-</span>
                  <span className="contact-value">
                    <a
                      href="https://www.linkedin.com/in/sumit-panchal-b790a8236/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <b>linkedin.com/in/sumit-panchal</b>
                    </a>
                  </span>
                </div>

                {/* LOCATION */}
                <div className="contact-row">
                  <span className="contact-label"><b>Location</b></span>
                  <span className="contact-icon">📍</span>
                  <span className="contact-separator">-</span>
                  <span className="contact-value">
                    <b>Ahmedabad (Open to Remote / Hybrid)</b>
                  </span>
                </div>

              </div>
            </section>



          </section>
        </main>
      </section>
    </>
  );
}
