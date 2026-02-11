import { useEffect } from "react";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/index.css";
import { Link } from "react-router-dom";


export default function Home() {
    usePageAnimations();

    useEffect(() => {
        const anchorIcons = document.querySelectorAll(".anchor-icon");

        const handleAnchorClick = (e) => {
            e.preventDefault();
            const id = e.currentTarget.getAttribute("data-target");
            if (!id) return;

            const fullURL =
                window.location.origin + window.location.pathname + "#/#" + id;

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
        <section className="index-page">
            <main className="index">
                <section className="container section-lg">
                    <section className="card animate-content">
                        <h2><b>Quality Analyst Engineer</b></h2>

                        <p className="summary-paragraph">
                            <b>Detail-oriented QA Engineer</b> with <b>4 years 6 months of professional experience</b> in <b>manual and functional testing</b> of <b>web and mobile applications</b>, delivering <b>high-quality</b>, <b>stable</b>, and <b>user-friendly software products</b>. Proven expertise in <b>end-to-end testing</b>, <b>regression testing</b>, <b>UAT support</b>, and <b>defect lifecycle management</b> across multiple domains including <b>taxi booking applications</b>, <b>fintech platforms</b>, <b>real estate systems</b>, and <b>SaaS products</b>.
                        </p>

                        <p className="summary-paragraph">
                            Strong understanding of the <b>Software Testing Life Cycle (STLC)</b>, <b>Software Development Life Cycle (SDLC)</b> and <b>Bug Defect Life Cycle</b> with hands-on experience in <b>Agile / Scrum environments</b>. Highly skilled in <b>test case design</b>, <b>requirement analysis</b>, <b>test execution</b>, <b>bug reporting</b>, and <b>cross-team collaboration</b> for timely <b>defect resolution</b>. Known for <b>excellent attention to detail</b>, <b>strong analytical skills</b>, and a <b>proactive quality-driven approach</b> to identifying <b>potential risks</b> before <b>production release</b>.
                        </p>

                    </section>

                    <hr className="view-line" />

                    <section className="card">

                        <h3 id="technical-skills" className="heading-link">
                            <b>🛠️ Technical Skills & Tools</b>
                            <a href="#/#technical-skills" className="anchor-icon" data-target="technical-skills">🔗</a>
                        </h3>

                        {/* <ul className="skills-list">
                            <li>Manual Testing: <b>Functional Testing, Regression Testing, UAT, Smoke & Sanity Testing, Exploratory Testing</b></li>
                            <li>Bug Tracking & Test Management: <b>JIRA, Bugzilla, TestRail</b></li>
                            <li>Version Control: <b>Git, GitHub</b></li>
                            <li>Collaboration Tools: <b>Confluence, Slack, Microsoft Teams</b></li>
                            <li>Operating Systems: <b>Windows, macOS, Android, iOS</b></li>
                            <li>Browsers: <b>Chrome, Firefox, Safari, Edge</b></li>
                        </ul> */}

                        <ul className="skills-list">
                            <li><b>Manual Testing Skills:</b> Functional Testing, Regression Testing, Smoke Testing, Sanity Testing, System Testing, Integration Testing, End-to-End Testing, Exploratory Testing, Compatibility Testing, UI/UX Testing, Ad-hoc Testing, User Acceptance Testing (UAT) </li>

                            <li><b>Test Design & Documentation:</b> Test Case Design, Test Scenario Creation, Test Plan Preparation, Requirement Analysis, Traceability Matrix (RTM), Test Data Preparation, Test Execution Reporting</li>

                            <li><b>Bug Tracking & Test Management Tools:</b> JIRA, Bugzilla, TestRail, Zephyr, ClickUp</li>

                            <li><b>Agile & Process Knowledge:</b> Agile/Scrum Methodology, Sprint Planning, Daily Stand-ups, Sprint Review, Retrospective Participation, Defect Lifecycle Management, STLC, SDLC</li>

                            <li><b>Collaboration & Communication Tools:</b> Confluence, Slack, Microsoft Teams, Email Communication, Documentation Collaboration</li>

                            <li><b>Operating Systems & Platforms:</b> Windows, macOS, Android, iOS</li>

                            <li><b>Browser & Device Testing:</b> Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Cross-browser Testing, Responsive Testing</li>  

                            {/* <li><b>API & Basic Backend Testing (Manual):</b> Postman (API Validation), Request/Response Validation, Status Code Verification, Basic JSON Validation</li> */}

                            <li><b>Performance & Quality Awareness:</b> Basic Performance Testing Knowledge, Usability Testing, Accessibility Awareness, Security Testing Fundamentals</li>
                        </ul>
                    </section>

                    <hr className="view-line" />

                    <section className="card">

                        <h3 id="my-mission" className="heading-link">
                            <b>🎯 My Mission</b>
                            <a href="#/#my-mission" className="anchor-icon" data-target="my-mission">🔗</a>
                        </h3>

                        <p className="summary-paragraph">
                            My mission is to ensure that every product I test meets the highest standards of <b>functionality,
                                reliability,
                                performance, and user experience</b>. I aim to identify defects before users do, safeguard business
                            workflows,
                            and contribute to delivering flawless releases.
                        </p>
                    </section>

                    <hr className="view-line" />

                    <section className="card">

                        <h3 id="my-vission" className="heading-link">
                            <b>👁️ My Vission</b>
                            <a href="#/#my-vission" className="anchor-icon" data-target="my-vission">🔗</a>
                        </h3>

                        <p className="summary-paragraph">
                            To become a trusted QA professional known for <b>precision, consistency, and technical depth</b>, while
                            continuously
                            evolving my skills in advanced testing practices. I aspire to contribute to impactful digital products that
                            improve
                            everyday user interactions across the world.
                        </p>
                    </section>
                    <hr className="view-line" />

                    <section className="card">


                        <h3 id="featured-portfolio" className="heading-link">
                            <b>📂 Featured Portfolio</b>
                            <a href="#/#featured-portfolio" className="anchor-icon" data-target="featured-portfolio">🔗</a>
                        </h3>

                        <div>
                            <Link to="/portfolio" className="btn-primary">
                                View Portfolio
                            </Link>
                        </div>

                        <div className="index-card-grid">
                            <img src={`${import.meta.env.BASE_URL}image/QA14.jpg`} />
                            <img src={`${import.meta.env.BASE_URL}image/QA15.jpg`} />
                            <img src={`${import.meta.env.BASE_URL}image/QA16.jpg`} />
                            {/* <img src={`${import.meta.env.BASE_URL}image/home7.jpg`} /> */}

                        </div>
                    </section>
                </section>
            </main>
        </section>
    );
}
