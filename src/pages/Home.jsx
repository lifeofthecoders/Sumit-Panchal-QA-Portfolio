import usePageAnimations from "../hooks/usePageAnimations";
import "../assets/css/index.css";



export default function Home() {
    usePageAnimations();

    return (
       <section className="index-page">
       <main className="index">
       <section className="container section-lg">
            <section className="card animate-content">
                <h2><b>Quality Analyst Engineer</b></h2>

                <p className="summary-paragraph">
                    Detail-oriented QA Engineer with 4 years of professional experience in manual and functional testing of web
                    and
                    mobile applications, delivering high-quality, stable, and user-friendly software products. Proven expertise in
                    end-to-end testing, regression testing, UAT support, and defect lifecycle management across multiple domains
                    including taxi booking apps, fintech, real estate platforms, and SaaS products.
                </p>

                <p className="summary-paragraph">
                    Strong understanding of the Software Testing Life Cycle (STLC) and Software Development Life Cycle (SDLC) with
                    hands-on experience in Agile/Scrum environments. Highly skilled in test case design, requirement analysis,
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
                    <a className="anchor-icon" data-target="technical-skills">🔗</a>
                </h3>
                <ul className="skills-list">
                    <li>Manual Testing: Functional Testing, Regression Testing, UAT, Smoke & Sanity Testing, Exploratory Testing
                    </li>
                    <li>Bug Tracking & Test Management: JIRA, Bugzilla, TestRail</li>
                    <li>Version Control: Git, GitHub</li>
                    <li>Collaboration Tools: Confluence, Slack, Microsoft Teams</li>
                    <li>Operating Systems: Windows, macOS, Android, iOS</li>
                    <li>Browsers: Chrome, Firefox, Safari, Edge</li>
                </ul>
            </section>

            <hr className="view-line" />

            <section className="card">
                <h3 id="my-mission" className="heading-link">
                    <b>🎯 My Mission</b>
                    <a className="anchor-icon" data-target="my-mission">🔗</a>
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
                    <a className="anchor-icon" data-target="my-vission">🔗</a>
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
                    <a className="anchor-icon" data-target="featured-portfolio">🔗</a>
                </h3>
                
                <div>
                <a href="/portfolio" className="btn-primary">
                    <b>View Portfolio</b>
                </a>
                </div>

                <div className="index-card-grid">
                    <img src="/image/home4.jpg" />
                    <img src="/image/home4.jpg" />
                    <img src="/image/home4.jpg" />
                    <img src="/image/home4.jpg" />
                </div>
            </section>
        </section>
        </main>
       </section>
    );
}
