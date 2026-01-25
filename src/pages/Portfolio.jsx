import { useEffect } from "react";
import Header from "../components/Header";
import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/portfolio.css";
import "../assets/js/portfolio";
import { Link } from "react-router-dom";

export default function Portfolio() {
    // ✅ Same animation hook as About
    usePageAnimations();

    // Optional: scroll to top on route change (About already does this)
    useEffect(() => {
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
            <section className="portfolio-page">
                <main className="portfolio">
                    <section className="portfolio-container section-lg">

                        {/* --- CARD 1 --- */}
                        <section className="portfolio-card">

                            <div className="professional-summary animate-content">

                                <h3><b>Quality Assurance Engineer</b></h3>

                                <p className="summary-paragraph">
                                    I’m <b>Sumit Panchal</b>, a results-driven <b>Quality Assurance Engineer</b> with over <b>4 years 6 months of hands-on
                                        experience</b> in manual testing for <b>web and mobile applications.</b> I hold a <b>Bachelor of Engineering
                                            in
                                            Electronics and Communication Engineering from Silver Oak College of Engineering and Technology</b>,
                                    affiliated
                                    with <b>Gujarat Technological University (GTU).</b>
                                </p>

                                <p className="summary-paragraph">
                                    Throughout my professional journey, I have been deeply involved in the <b>end-to-end software testing life
                                        cycle
                                        (STLC)</b> - from <b>requirement analysis and test planning to execution, defect tracking, and final
                                            delivery.</b> My experience spans across multiple domains, where I’ve worked closely with developers,
                                    product
                                    managers, and cross-functional teams to ensure the delivery of <b>high-quality, reliable, and user-friendly
                                        software products.</b>
                                </p>

                            </div>

                            <div class="card-grid section-md">

                                <h3>I specialize in <b>manual testing</b> with strong expertise in:</h3>

                                <ul class="skills-list">
                                    <li>Functional, Regression, Smoke, Sanity & UAT Testing</li>
                                    <li>UI/UX Validation & Cross-Browser Testing</li>
                                    <li>Web & Mobile Application Testing (Android & iOS)</li>
                                    <li>Payment Gateway & Wallet Testing</li>
                                    <li>Test Case Design & Execution</li>
                                    <li>Bug Reporting & Tracking</li>
                                    <li>SDLC & STLC Processes</li>
                                    <li>Jira for Bug Tracking & Test Management</li>
                                    <li>UAT Execution & Client Support</li>
                                    <li>Agile & Scrum Environments</li>
                                </ul>

                            </div>

                            <p class="summary-paragraph">
                                What sets me apart is my <b>attention to detail, analytical mindset, and strong ownership of product
                                    quality.</b>
                                I thrive in fast-paced environments and continuously work on improving testing efficiency and effectiveness. I’m
                                passionate about learning new tools, methodologies, and best practices in quality engineering to stay aligned
                                with
                                industry standards.
                            </p>

                            <p class="summary-paragraph">
                                🔹 <b>Currently open to new opportunities</b> in QA / Manual Testing where I can contribute my skills and grow
                                with a forward-thinking organization. You can get a better idea about my work through
                                <Link to="/projects" className="btn-connect"><b> Projects. </b></Link>
                            </p>

                        </section>

                        <hr className="view-line" />

                        {/* --- RESPONSIBILITIES --- */}
                        <section className="portfolio-card">

                            <h3 id="responsibilities" className="heading-link">
                                <b>🧪 My core responsibilities as a Quality Assurance Engineer</b>
                                <a href="/#portfolio/#responsibilities" className="anchor-icon" data-target="portfolio/#responsibilities">🔗</a>
                            </h3>

                            <p class="summary-paragraph">
                                As a Quality Assurance Engineer, I am responsible for ensuring the delivery of high-quality, reliable, and
                                user-friendly software products by implementing structured testing processes and maintaining strict quality
                                standards throughout the development lifecycle. My key responsibilities include:
                            </p>

                            <div class="skills-list-grid">
                                <ul class="skills-list">
                                    <li>Performed <b>end-to-end manual testing</b> across <b>10+ enterprise web and mobile applications.</b></li>
                                    <li>Prepared and executed <b>1000+ test cases</b> based on business and functional requirements.</li>
                                    <li>Conducted <b>Functional, Regression, Smoke, Sanity, System, and UAT testing</b> in Agile environments.
                                    </li>
                                    <li>Identified, logged, and tracked <b>300+ defects</b> using Jira with a <b>95% defect acceptance rate.</b>
                                    </li>
                                    <li>Reduced production defects by <b>40%</b> through early-phase testing and root cause analysis.</li>
                                    <li>Executed <b>cross-browser and cross-device testing</b> across Chrome, Firefox, Edge, Android, and iOS.
                                    </li>
                                    <li>Worked closely with <b>developers, business analysts, and product owners</b> to ensure smooth sprint
                                        delivery.
                                    </li>
                                    <li>Prepared <b>test plans, test execution reports, defect metrics, and release sign-off documents.</b></li>
                                    <li>Supported <b>15+ successful production releases</b> with <b>zero critical post-release defects.</b></li>
                                    <li>Followed <b>organizational QA processes, compliance standards, and documentation guidelines.</b></li>
                                </ul>
                            </div>

                        </section>

                        <hr class="view-line" />

                        {/* --- ACHIEVEMENTS --- */}
                        <section className="portfolio-card">

                            <h3 id="achievements" className="heading-link">
                                <b>🏆 Key Achievements</b>
                                <a href="/#portfolio/#achievements" className="anchor-icon" data-target="portfolio/#achievements">🔗</a>
                            </h3>

                            <div class="skills-list-grid">
                                <ul class="skills-list">
                                    <li>Achieved <b>40% reduction in post-production defects</b> through improved regression strategy.</li>
                                    <li>Ensured <b>99% release stability</b> across multiple project deployments.</li>
                                    <li>Prevented <b>50+ critical and high-severity production issues</b> through proactive testing.</li>
                                    <li>Delivered <b>100% on-time sprint commitments</b> for testing activities.</li>
                                    <li>Recognized for <b>high accuracy in defect reporting and strong test coverage.</b></li>
                                    <li>Played a key role in <b>client UAT support and production release sign-off.</b></li>
                                </ul>
                            </div>

                        </section>

                        <hr class="view-line"></hr>

                        {/* --- Technical & Functional Skills --- */}
                        <section className="portfolio-card">

                            <h3 id="skills" className="heading-link">
                                <b>🧰 Technical & Functional Skills</b>
                                <a href="/#portfolio/#skills" className="anchor-icon" data-target="portfolio/#skills">🔗</a>
                            </h3>
                        
                            <div class="skills-list-grid">
                                <ul class="skills-list">
                                    <li>Testing Types: <b>Manual Testing, Functional, Regression, Smoke, Sanity, System, Integration, UAT</b></li>
                                    <li>Tools: <b>Jira (Bug Tracking & Test Management), Excel (Test Documentation)</b></li>
                                    <li>Platforms: <b>Web Applications, Mobile Applications (Android & iOS)</b></li>
                                    <li>Processes: <b>SDLC, STLC, Agile/Scrum</b></li>
                                    <li>Other: <b>Cross-Browser Testing, UI/UX Validation, Defect Life Cycle, Test Case Documentation</b></li>
                                </ul>
                            </div>

                        </section>

                        <hr class="view-line" />

                        {/* --- Why Hire Me --- */}
                        <section className="portfolio-card">
                            <h3 id="why-hire-me" className="heading-link">
                                <b>💼 Why Hire Me - Manual QA Professional</b>
                                <a href="/#portfolio/#why-hire-me" className="anchor-icon" data-target="portfolio/#why-hire-me">🔗</a>
                            </h3>

                            <div class="skills-list-grid">
                                <ul class="skills-list">
                                    <li>
                                        <b>Quality-First Mindset:</b>
                                        Strong focus on delivering defect-free releases through structured, detail-oriented manual testing aligned
                                        with business and user requirements.
                                    </li>

                                    <li>
                                        <b>Manual Testing Expertise:</b>
                                        Hands-on experience in Functional, Regression, Smoke, Sanity, Integration, and UAT testing across multiple
                                        Agile release cycles.
                                    </li>

                                    <li>
                                        <b>Multi-Domain Experience:</b>
                                        Worked on Transportation (Taxi & Mobility), Social Networking, E-Commerce, Gaming, and Sustainability
                                        platforms with real-world user flows.
                                    </li>

                                    <li>
                                        <b>Real-Time User Flow Validation:</b>
                                        Validated complex workflows including ride booking & cancellation, payments & wallets, orders, multiplayer
                                        gaming, chat systems, notifications, and admin dashboards.
                                    </li>

                                    <li>
                                        <b>Test Documentation & Bug Reporting:</b>
                                        Create clear, traceable test cases and execution reports; log high-quality defects with reproducible
                                        steps,
                                        evidence, severity, and priority using Jira & Excel.
                                    </li>

                                    <li>
                                        <b>Ownership & Reliability:</b>
                                        Take complete ownership of assigned modules, consistently meeting timelines while maintaining quality from
                                        requirement analysis through UAT and release validation.
                                    </li>
                                </ul>

                            </div>

                            <div>
                                <Link to="/contact" className="btn-connect"><b> Hire a Reliable Manual QA </b></Link>
                            </div>

                        </section>

                        <hr class="view-line" />

                        <section class="portfolio-card">
                            <div>
                                <p class="summary-paragraph">
                                    Get to know me better as a <b>Quality Assurance Engineer</b> and how I trained as a manual testing engineer
                                    in
                                    my past 4 years 6 months through Projects and more information about myself on <Link to="/about" className="btn-connect"><b> About </b></Link>
                                </p>
                            </div>

                            <div>
                                <Link to="/contact" className="btn-primary">
                                    <b>Let's connect and collaborate!</b>
                                </Link>
                            </div>

                        </section>
                    </section>
                </main>
            </section>
        </>
    );
}
