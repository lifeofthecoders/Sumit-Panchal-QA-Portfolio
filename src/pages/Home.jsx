import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/index.css";
import { Link } from "react-router-dom";


export default function Home() {
    usePageAnimations();

    return (
        <section className="index-page">
            <main className="index">
                <section className="container section-lg">
                    <section className="card animate-content">
                        <h2><b>Quality Analyst Engineer</b></h2>

                        <p className="summary-paragraph">
                            Detail-oriented <b>QA Engineer</b> with <b>4 years & 6 months</b> of professional experience in <b>manual and functional testing</b> of web
                            and
                            mobile applications, delivering high-quality, stable, and user-friendly software products. Proven expertise in
                            <b>end-to-end testing, regression testing, UAT support, and defect lifecycle management across multiple domains
                            including taxi booking apps, fintech, real estate platforms, and SaaS products.</b>
                        </p>

                        <p className="summary-paragraph">
                            Strong understanding of the <b>Software Testing Life Cycle (STLC) and Software Development Life Cycle (SDLC) with
                            hands-on experience in Agile/Scrum environments</b>. Highly skilled in test case design, requirement analysis,
                            test
                            execution, bug reporting, and coordination with development teams for timely defect resolution. Known for
                            excellent attention to detail, strong analytical skills, and a proactive approach to identifying potential
                            risks
                            before production release.
                        </p>
                    </section>

                    <hr className="view-line" />

                    <section className="card">

                        <h3 id="technical-skills" className="heading-link">
                            <b>🛠️ Technical Skills & Tools</b>
                            <a href="#/#technical-skills" className="anchor-icon" data-target="technical-skills">🔗</a>
                        </h3>

                        <ul className="skills-list">
                            <li>Manual Testing: <b>Functional Testing, Regression Testing, UAT, Smoke & Sanity Testing, Exploratory Testing</b></li>
                            <li>Bug Tracking & Test Management: <b>JIRA, RedmineTrello, Mentis</b></li>
                            <li>Version Control: <b>Git, GitHub</b></li>
                            <li>Collaboration Tools: <b>Confluence, Slack, Microsoft Teams</b></li>
                            <li>Operating Systems: <b>Windows, macOS, Android, iOS</b></li>
                            <li>Browsers: <b>Chrome, Firefox, Safari, Edge</b></li>
                        </ul>
                    </section>

                    <hr className="view-line" />

                    <section className="card">
                        <h3 id="my-mission" className="heading-link">
                            <b>🎯 My Mission</b>
                            <a href="#/my-vission" className="anchor-icon">🔗</a>
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
                            <a href="#/my-vission" className="anchor-icon">🔗</a>
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
                            <a href="#/featured-portfolio" className="anchor-icon">🔗</a>
                        </h3>

                        <div>
                            <Link to="/portfolio" className="btn-primary">
                                View Portfolio
                            </Link>
                        </div>

                        <div className="index-card-grid">
                            <img src={`${import.meta.env.BASE_URL}image/home4.jpg`} />
                            <img src={`${import.meta.env.BASE_URL}image/home4.jpg`} />
                            <img src={`${import.meta.env.BASE_URL}image/home4.jpg`} />
                            <img src={`${import.meta.env.BASE_URL}image/home4.jpg`} />

                        </div>
                    </section>
                </section>
            </main>
        </section>
    );
}
