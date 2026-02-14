import { useEffect } from "react";
import "../assets/css/services.css"; // keep your existing import
import "../assets/js/services";       // keep if already present
import usePageAnimations from "../hooks/usePageAnimations";

export default function Services() {
    usePageAnimations(); // ✅ ADD THIS

    // ✅ ANIMATION HOOK - SAME AS ABOUT PAGE
    useEffect(() => {
        /* ============================
           ANCHOR ICON COPY LINK
           ============================ */
        const icons = document.querySelectorAll(".anchor-icon");

        icons.forEach((icon) => {
            icon.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const id = icon.getAttribute("data-target");
                if (!id) return;

                const url =
                    window.location.origin +
                    window.location.pathname +
                    "#" +
                    id;

                window.history.replaceState(null, "", `#${id}`);

                navigator.clipboard.writeText(url);

                icon.style.width = `${icon.offsetWidth}px`;
                icon.innerText = "✅";

                setTimeout(() => {
                    icon.innerText = "🔗";
                    icon.style.width = "";
                }, 1200);
            };
        });

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
            icons.forEach((icon) => (icon.onclick = null));
            animatedElements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
            <section className="services-page">
                {/* HERO TITLE ONLY – HEADER IS ALREADY RENDERED */}
                <main className="serviceses">
                    <section className="container section-lg bg-gray animate-content in-view">

                        <div className="services-grid">

                            <h3 id="qa-services" className="heading-link">
                                <b>🛡️ QA Services I Provide</b>
                                 <a href="/#services/#qa-services" className="anchor-icon" data-target="services/#qa-services">🔗</a>                          
                            </h3>

                            <p className="summary-paragraph">
                                Comprehensive manual testing services including functional,
                                regression, usability, and exploratory testing to ensure
                                software quality and user satisfaction.
                            </p>
                        </div>

                        <div class="overlay slide-up in-view">
                            <div className="cards-grid">

                                {[
                                    {
                                        title: "Manual Functional Testing",
                                        items: [
                                            "End-to-end validation of user workflows, business logic, and application behavior.",
                                            "Functional testing across web and mobile platforms (Android & iOS).",
                                            "Verification of core features against approved requirements.",
                                            "Positive, negative, boundary, and edge-case testing.",
                                            "Scenario-based execution aligned with real user journeys."
                                        ]
                                    },
                                    {
                                        title: "Regression & Re-testing",
                                        items: [
                                            "Verification of previously tested functionality after code changes or updates.",
                                            "Ensuring that new code doesn't break existing functionality.",
                                            "Re-execution of test cases to confirm fixes and validate stability.",
                                            "Documentation of test results and regression findings.",
                                            "Release readiness and stability assessment."
                                        ]
                                    },
                                    {
                                        title: "Black Box Testing",
                                        items: [
                                            "Testing without knowledge of internal implementation details.",
                                            "Focus on input/output behavior and system functionality.",
                                            "Coverage of positive, negative, and boundary test scenarios.",
                                            "Identification of defects and inconsistencies in the system.",
                                            "Ensuring compliance with functional specifications and user expectations."
                                        ]
                                    },
                                    {
                                        title: "Smoke & Sanity Testing",
                                        items: [
                                            "Rapid verification of critical functionalities after a build or code change.",
                                            "Identification of critical issues that prevent further testing.",
                                            "Confirmation that the system is stable enough for more detailed testing.",
                                            "Validation of core features and user workflows.",
                                            "Support for go/no-go release decisions."
                                        ]
                                    },
                                    {
                                        title: "Test Design & Documentation",
                                        items: [
                                            "Design of structured, reusable test scenarios and test cases.",
                                            "Alignment with business requirements and acceptance criteria.",
                                            "Test data preparation and execution tracking.",
                                            "Maintenance of test artifacts for future cycles.",
                                            "Adherence to industry-standard QA best practices."
                                        ]
                                    },
                                    {
                                        title: "Bug Reporting & Tracking",
                                        items: [
                                            "Detailed defect logging with clear reproduction steps.",
                                            "Priority and severity classification for effective triaging.",
                                            "Root cause analysis support and re-verification of fixes.",
                                            "Continuous collaboration with development teams.",
                                            "Defect lifecycle management until closure."
                                        ]
                                    },
                                    {
                                        title: "UAT & Release Support",
                                        items: [
                                            "Coordination with business users and stakeholders during UAT.",
                                            "Validation of final builds against business expectations.",
                                            "Support for client demos and stakeholder sign-offs.",
                                            "Tracking and resolution of UAT feedback.",
                                            "Ensuring production release readiness."
                                        ]
                                    },
                                    {
                                        title: "Cross-Platform Testing",
                                        items: [
                                            "Functional validation across Web, Android, and iOS platforms.",
                                            "Consistency checks for UI, workflows, and user experience.",
                                            "Device and browser compatibility testing.",
                                            "Performance and responsiveness verification.",
                                            "Seamless user experience across platforms."
                                        ]
                                    }
                                ].map((card) => (
                                    <div className="overlay slide-up" key={card.title}>
                                        <div className="cards">
                                            <div className="cards-header">
                                                <div className="wave-bg">
                                                    <h3 className="wave-title">
                                                        <b>{card.title}</b>
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="stats">
                                                <ul className="stats-list">
                                                    {card.items.map((item, i) => (
                                                        <li key={i}>
                                                            <strong>{item}</strong>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </section>
                </main>
            </section>
        </>
    );
}
