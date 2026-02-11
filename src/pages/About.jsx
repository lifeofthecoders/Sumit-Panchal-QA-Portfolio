import { useEffect } from "react";
import "../assets/css/about.css";
import { Link } from "react-router-dom";

export default function About() {

    // ✅ ADD THE useEffect RIGHT HERE
    useEffect(() => {
        /* ============================
           ANCHOR ICON COPY LINK
           ============================ */
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
            ".slide-up, .hero-animate h1, .hero-animate h2, .profile-slide, .about-wrapper-anim"
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
            anchorIcons.forEach((icon) =>
                icon.removeEventListener("click", handleAnchorClick)
            );
            animatedElements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    // ✅ END useEffect

    return (
        <>
            <section className="about-page">
                {/* ABOUT HERO STRIP */}
                <section className="about-hero-strip">
                    <div className="about-overlay">
                        <div className="about-wrapper about-wrapper-anim">

                            {/* LEFT PROFILE IMAGE */}
                            <div className="about-left profile-card">
                                <div className="profile-circle">
                                    <img src="./image/profile.jpg" alt="Sumit Panchal" />
                                </div>

                                <div className="profile-info">
                                    <h3 className="profile-title"><b>Sumit Panchal</b></h3>
                                    <p className="profile-designation">
                                        <b>Quality Assurance Engineer</b>
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT ABOUT CONTENT */}
                            <div className="about-right">
                                <h2><b><u>SUMIT PANCHAL</u></b></h2>

                                <p className="summary-paragraph">
                                    I am a highly motivated and result-driven <b>Quality Assurance Engineer with 4 years 6 months of professional experience</b> 
                                    in testing <b>web and mobile applications</b>, delivering high-quality, stable, and user-centric software
                                    products. I am passionate about continuous learning, adopting new technologies, and improving testing
                                    processes to enhance overall product quality and business outcomes. I perform effectively both independently and
                                    as part of cross-functional Agile teams.
                                </p>

                                <p className="summary-paragraph">
                                    I am currently working as a <b>Quality Assurance Engineer at Echoinnovate IT - Mobile App Development & AI Digital 
                                        Transformation Company (June 2021 - Present)</b>, where I have played a key role in testing and
                                    delivering <b>10+ web and mobile applications</b> across multiple business domains. I have successfully designed 
                                    and executed <b>1,000+ test cases</b>, reported and tracked <b>300+ defects</b>, and contributed to achieving a 
                                    <b>40% reduction in post-production defects</b> through early-phase testing and strong regression strategies. My efforts 
                                    have directly supported <b>15+ successful production releases with zero critical severity issues post-deployment</b>, helping 
                                    maintain a <b>99% release stability rate.</b>
                                </p>

                                <p className="summary-paragraph">
                                    Known for being <b>reliable, detail-oriented, and highly accountable</b>, I consistently meet tight project deadlines 
                                    while ensuring strict adherence to quality and compliance standards. I collaborate closely with 
                                    <b>developers, product managers, and stakeholders</b> to ensure <b>accurate defect resolution and seamless 
                                    product delivery</b>. If you are interested in working with me or discussing professional opportunities, 
                                    I would be pleased to <Link to="/contact" className="btn-connect"><b> connect </b></Link> to discuss potential 
                                    professional engagements.
                                </p>

                            </div>

                        </div>
                    </div>
                </section>

                {/* MAIN CONTENT */}
                <main className="about">
                    <section className="container section-lg">

                        <hr className="view-line" />

                        {/* PROFESSIONAL OVERVIEW */}
                        <section className="about-cards">

                            <h3 id="Professional-overview" className="heading-link">
                                <b>🔍 Professional Overview</b>
                                <a href="/#about/#Professional-overview" className="anchor-icon" data-target="about/#Professional-overview">🔗</a>
                            </h3>

                            <p className="summary-paragraph">
                                I am a quality-driven Manual QA professional with strong analytical and
                                problem-solving skills, focused on delivering reliable, high-quality software.
                            </p>

                            <div className="cards-grid">

                                {[
                                    { title: "Primary Role", value: "Manual QA Engineer" },
                                    { title: "Platforms", value: "Web · Android · iOS" },
                                    { title: "Key Focus Areas", value: "Functional, Regression & UAT" },
                                    { title: "Domains Covered", value: "Ride-Hailing, Networking, E-Com, Gaming" }
                                ].map((item) => (
                                    <div className="overlay slide-up" key={item.title}>
                                        <div className="cards">
                                            <div className="cards-header">
                                                <div className="wave-bg">
                                                    <h1 className="wave-title"><b>{item.title}</b></h1>
                                                </div>
                                            </div>
                                            <div className="stats">
                                                <ul className="stats-list">
                                                    <li><strong>{item.value}</strong></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </section>

                        <hr className="view-line" />

                        {/* CORE SKILLS */}
                        <section className="about-cards">

                            <h3 id="core-skills" className="heading-link">
                                <b>🔑 Core Skills</b>
                                <a href="/#about/#core-skills" className="anchor-icon" data-target="about/#core-skills">🔗</a>
                            </h3>

                            <p className="summary-paragraph">A skill set focused on uncovering critical defects and ensuring reliable releases.</p>

                            <div className="cards-grid">

                                <div className="overlay slide-up">
                                    <div className="cards">
                                        <div className="cards-header">
                                            <div className="wave-bg">
                                                <h1 className="wave-title"><b>Testing Types</b></h1>
                                            </div>
                                        </div>
                                        <div className="stats">
                                            <ul className="stats-list">
                                                <li><strong>Manual Functional testing</strong></li>
                                                <li><strong>Regression & Re-testing</strong></li>
                                                <li><strong>Smoke & Sanity Testing</strong></li>
                                                <li><strong>Integration & End-to-End Testing</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="overlay slide-up">
                                    <div className="cards">
                                        <div className="cards-header">
                                            <div className="wave-bg">
                                                <h1 className="wave-title"><b>Process & Practices</b></h1>
                                            </div>
                                        </div>
                                        <div className="stats">
                                            <ul className="stats-list">
                                                <li><strong>SDLC & STLC</strong></li>
                                                <li><strong>Defect Life Cycle</strong></li>
                                                <li><strong>Test Case Design & Execution</strong></li>
                                                <li><strong>Requirement Analysis & Traceability</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="overlay slide-up">
                                    <div className="cards">
                                        <div className="cards-header">
                                            <div className="wave-bg">
                                                <h1 className="wave-title"><b>Business Workflows</b></h1>
                                            </div>
                                        </div>
                                        <div className="stats">
                                            <ul className="stats-list">
                                                <li><strong>Booking & Real-time Tracking</strong></li>
                                                <li><strong>Payment & Wallet Flows</strong></li>
                                                <li><strong>Chat & Notification Systems</strong></li>
                                                <li><strong>Admin & Moderation Panels</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="overlay slide-up">
                                    <div className="cards">
                                        <div className="cards-header">
                                            <div className="wave-bg">
                                                <h1 className="wave-title"><b>Collaboration & Delivery</b></h1>
                                            </div>
                                        </div>
                                        <div className="stats">
                                            <ul className="stats-list">
                                                <li><strong>Agile Sprint Participation</strong></li>
                                                <li><strong>Bug Triage & Prioritization</strong></li>
                                                <li><strong>UAT Support & Sign-off</strong></li>
                                                <li><strong>Cross-functional Communication</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </section>

                        <hr className="view-line" />

                        {/* ACADEMIC & EXPERIENCE */}
                        <section className="about-cards">
                            <h3 id="academic-qualifications" className="heading-link">
                                <b>Academic Qualifications</b>
                                <a href="/#about/#academic-qualifications" className="anchor-icon" data-target="about/#academic-qualifications">🔗</a>
                            </h3>

                            <ul>
                                <li>BSc (Hons) Business Information Systems - University of Westminster</li>
                                <li>GCE Advanced Level - Ananda College Colombo</li>
                                <li>GCE Ordinary Level - Ananda College Colombo</li>
                            </ul>

                            <h3 id="work-experience" className="heading-link">
                                <b>Work Experience</b>
                                <a href="/#about/#work-experience" className="anchor-icon" data-target="about/#work-experience">🔗</a>
                            </h3>

                            <ul>
                                <li>Quality Assurance Engineer - ZILLIONe Business Solutions</li>
                                <li>Test Automation Engineer - CPOS Project</li>
                                <li>Freelance Graphic Designer</li>
                            </ul>

                            <h3 id="achievements" className="heading-link">
                                <b>Achievements & Activities</b>
                                <a href="/#about/#achievements" className="anchor-icon" data-target="about/#achievements">🔗</a>
                            </h3>

                            <ul>
                                <li>Assistant Band Leader - Ananda College Brass Band</li>
                                <li>Secretary - Wild Life Association</li>
                                <li>Western Province Chess Champion</li>
                            </ul>
                        </section>

                    </section>
                </main>
            </section>
        </>
    );
}
