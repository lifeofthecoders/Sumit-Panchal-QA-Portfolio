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
      <section className="contact-page">
        <main className="contact">
          <section className="container section-lg animate-content">

            {/* LET'S CONNECT */}
            <section className="contact-card">
              <div className="lets-connect">

                <h3 id="lets-connect" className="heading-link">
                  <b>🤝 Let’s Connect</b>
                  <a href="/#contact/#lets-connect" className="anchor-icon" data-target="contact/#lets-connect">🔗</a>
                </h3>

                <h4><b>(Collaboration & Communication)</b></h4>

                {/* <p className="summary-paragraph">
                  Whether you are building a new product or strengthening an existing one, I would be glad to support your
                  quality assurance efforts and help ensure reliable, user-focused software delivery.
                </p> */}

                {/* <p className="summary-paragraph">
                  If you are looking for a <b>Manual QA Engineer</b> who can take ownership of test planning, execution, and
                  coordination across <b>web and mobile applications</b>, feel free to reach out.
                </p>

                <p className="summary-paragraph">
                  I am open to opportunities with <b>product-based companies, startups, and service organizations</b> that
                  <b> value quality, reliability, and a strong end-user experience.</b>
                </p> */}

                <div className="lets-connect-section">

                  <p className="summary-paragraph">
                    Whether you’re building a new product or enhancing an existing application,
                    I’d be glad to support your{" "}
                    <strong>Quality Assurance initiatives</strong> and help ensure{" "}
                    <strong>reliable, high-performance, and user-centric software delivery</strong>.
                  </p>

                  <p className="summary-paragraph">
                    Witness how a <strong>meticulous testing approach</strong>,{" "}
                    <strong>structured validation processes</strong>, and{" "}
                    <strong>modern QA solutions</strong> can elevate product quality to the next level.
                    My work emphasizes <strong>defect prevention</strong>,{" "}
                    <strong>usability validation</strong>, and{" "}
                    <strong>continuous quality improvement</strong> across releases.
                  </p>

                  <p className="summary-paragraph">
                    If you’d like to explore my <strong>testing toolkit</strong>,{" "}
                    <strong>frameworks</strong>, and{" "}
                    <strong>technical capabilities</strong> in detail, feel free to review the{" "}
                    <strong>Tools & Technologies</strong> and{" "}
                    <strong>QA Services</strong> sections of my portfolio.
                  </p>

                  <p className="summary-paragraph">
                    If you are looking for a <strong>Manual QA Engineer</strong> who can take
                    ownership of <strong>test planning</strong>,{" "}
                    <strong>test execution</strong>,{" "}
                    <strong>defect management</strong>, and{" "}
                    <strong>cross-platform validation</strong> across{" "}
                    <strong>web and mobile applications</strong>, feel free to reach out.
                  </p>

                  <p className="summary-paragraph">
                    I am open to collaborating with{" "}
                    <strong>product-based companies</strong>,{" "}
                    <strong>startups</strong>, and{" "}
                    <strong>service organizations</strong> that value{" "}
                    <strong>quality</strong>,{" "}
                    <strong>reliability</strong>, and an exceptional{" "}
                    <strong>end-user experience</strong>.
                  </p>

                  <p className="sign-off">
                    <strong>Happy Testing 🙂</strong>
                  </p>

                </div>



              </div>
            </section>

            <hr className="view-line" />

            {/* RESUME SECTION */}
            <section className="contact-card">
              <div className="resume-section">

                <h3 id="resume" className="heading-link">
                  <b>📑 Resume</b>
                  <a href="/#contact/#resume" className="anchor-icon" data-target="contact/#resume">🔗</a>
                </h3>

                <p className="summary-paragraph">
                  Download my latest resume to review my complete professional summary, tools, skills,
                  and detailed QA project experience.
                </p>

                <a
                  href="/Sumit-Panchal-QA-Portfolio/resume/Sumit_Panchal_QA_Resume.pdf"
                  download
                  className="btn-primary"
                >
                  Download Resume (PDF) ⬇️
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
