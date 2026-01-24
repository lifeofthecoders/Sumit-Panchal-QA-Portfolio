import { useEffect } from "react";
import "../assets/css/services.css"; // keep your existing import
import "../assets/js/services";       // keep if already present
import usePageAnimations from "../hooks/usePageAnimations";

export default function Services() {
    usePageAnimations(); // ✅ ADD THIS

    // ✅ ADD THIS EXACTLY HERE
    useEffect(() => {
        const icons = document.querySelectorAll(".anchor-icon");

        icons.forEach((icon) => {
            icon.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation(); // ✅ prevents browser focus scroll

                const id = icon.getAttribute("data-target");
                if (!id) return;

                // ✅ Copy URL only (NO SCROLL)
                const url =
                    window.location.origin +
                    window.location.pathname +
                    "#" +
                    id;

                // ✅ Update hash WITHOUT triggering scroll
                window.history.replaceState(null, "", `#${id}`);

                navigator.clipboard.writeText(url);

                // ✅ Prevent layout shift when icon changes
                icon.style.width = `${icon.offsetWidth}px`;
                icon.innerText = "✅";

                setTimeout(() => {
                    icon.innerText = "🔗";
                    icon.style.width = "";
                }, 1200);
            };
        });

        // cleanup (safe)
        return () => {
            icons.forEach((icon) => (icon.onclick = null));
        };
    }, []);


    useEffect(() => {
        // 🔹 FIX: reveal animated content on Services page
        const content = document.querySelector(".animate-content");
        if (content) {
            content.classList.remove("in-view");
            void content.offsetWidth; // force reflow
            content.classList.add("in-view");
        }
    }, []);

    useEffect(() => {
        const slideItems = document.querySelectorAll(".slide-up");

        slideItems.forEach((el) => {
            el.classList.remove("in-view");
            void el.offsetWidth; // force reflow
            el.classList.add("in-view");
        });
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
