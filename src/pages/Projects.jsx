import { useEffect } from "react";
import "../assets/css/projects.css";
import "../assets/js/projects";
import usePageAnimations from "../hooks/usePageAnimations";

export default function Projects() {
    usePageAnimations(); // ✅ ADD THIS

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
            <section className="projects-page">
                <section className="projects-section">
                    <section className="container section-lg bg-gray animate-content in-view">

                        <div className="services-grid">
                            <h3 id="my-projects" className="heading-link">
                                <b>📂 My Projects</b>
                                <a href="/#projects/#my-projects" className="anchor-icon" data-target="projects/#my-projects">🔗</a>
                            </h3>

                            <div className="projects-scroll">
                                {/* CARD 1 */}
                                <div className="card">
                                    <div className="card-header">
                                        <div className="wave-bg">
                                            <h1 className="wave-title">
                                                LYMÜV - Taxi Booking Application
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="stats">
                                        <label>Domain:</label>
                                        <strong>Transportation / Ride-Hailing</strong>

                                        <label>Platform:</label>
                                        <strong>Android, iOS, Web Admin</strong>

                                        <label>Role:</label>
                                        <strong>Manual QA Engineer</strong>
                                    </div>

                                    <div className="form">
                                        <div className="form-group">
                                            <label>Overview:</label>
                                            <strong>
                                                Real-time taxi booking platform with live tracking,
                                                digital payments, wallet, promotions, ratings, and invoicing.
                                            </strong>
                                        </div>

                                        <div className="form-group">
                                            <label>Key Testing Areas:</label>
                                            <strong>
                                                Ride Booking Flow, Driver Assignment, Payment & Wallet,
                                                Notifications, Report, Admin Panel.
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="responsibilities">
                                        <div className="responsibilities-group">
                                            <label>Responsibilities:</label>
                                            <ul>
                                                <li><strong>End-to-end testing of booking workflows.</strong></li>
                                                <li><strong>Validation of driver assignment logic.</strong></li>
                                                <li><strong>Payment gateway and wallet testing.</strong></li>
                                                <li><strong>Notification and invoicing verification.</strong></li>
                                                <li><strong>Admin panel functional testing.</strong></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="key-achievements">
                                        <div className="key-achievements-group">
                                            <label>Key Achievements:</label>
                                            <ul>
                                                <li><strong>Stable multi-platform releases.</strong></li>
                                                <li><strong>Critical defect prevention.</strong></li>
                                                <li><strong>Regression & UAT support.</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="card">
                                    <div className="card-header">
                                        <div className="wave-bg">
                                            <h1 className="wave-title">
                                                Dap Me - Professional Networking Application
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="stats">
                                        <label>Domain:</label>
                                        <strong>Social Networking / Professional Networking</strong>

                                        <label>Platform:</label>
                                        <strong>Android, iOS, Web Admin</strong>

                                        <label>Role:</label>
                                        <strong>Manual QA Engineer</strong>
                                    </div>

                                    <div className="form">
                                        <div className="form-group">
                                            <label>Overview:</label>
                                            <strong>
                                                Dap Me is a React Native–based professional networking app that
                                                enables users to connect, chat in real time, share profiles, and
                                                manage professional interactions securely, with built-in
                                                notifications and admin moderation.
                                            </strong>
                                        </div>

                                        <div className="form-group">
                                            <label>Key Testing Areas:</label>
                                            <strong>
                                                User Registration & Login, User Profile Management, Connections &
                                                Networking, Chat & Messaging, Notifications, Search & Discovery,
                                                Privacy & Account Settings, Admin Panel.
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="responsibilities">
                                        <div className="responsibilities-group">
                                            <label>Responsibilities:</label>
                                            <ul>
                                                <li><strong>Authentication and login validation.</strong></li>
                                                <li><strong>Profile management and user data testing.</strong></li>
                                                <li><strong>Chat and messaging module verification.</strong></li>
                                                <li><strong>Subscriptions and payment gateway.</strong></li>
                                                <li><strong>Admin moderation workflow testing.</strong></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="key-achievements">
                                        <div className="key-achievements-group">
                                            <label>Key Achievements:</label>
                                            <ul>
                                                <li><strong>Delivered multiple stable releases with zero critical production defects.</strong></li>
                                                <li><strong>Prevented major chat and notification issues before go-live.</strong></li>
                                                <li><strong>Improved app stability through regression coverage.</strong></li>
                                                <li><strong>Key contributor to final UAT sign-off.</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="card">
                                    <div className="card-header">
                                        <div className="wave-bg">
                                            <h1 className="wave-title">
                                                Bunny Books - Photo Book E-Commerce Application
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="stats">
                                        <label>Domain:</label>
                                        <strong>E-Commerce / Photo Printing / Custom Gifting</strong>

                                        <label>Platform:</label>
                                        <strong>Android, iOS, Web Admin</strong>

                                        <label>Role:</label>
                                        <strong>Manual QA Engineer</strong>
                                    </div>

                                    <div className="form">
                                        <div className="form-group">
                                            <label>Overview:</label>
                                            <strong>
                                                Bunny Books enables users to create and order high-quality printed
                                                photo books through a simple three-step process with secure
                                                checkout and global delivery.
                                            </strong>
                                        </div>

                                        <div className="form-group">
                                            <label>Key Testing Areas:</label>
                                            <strong>
                                                Photo upload, album creation, design preview, checkout, payment,
                                                delivery tracking, notifications, and admin management.
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="responsibilities">
                                        <div className="responsibilities-group">
                                            <label>Responsibilities:</label>
                                            <ul>
                                                <li><strong>Photo upload and album creation testing.</strong></li>
                                                <li><strong>Cart and checkout flow validation.</strong></li>
                                                <li><strong>Payment processing and order management.</strong></li>
                                                <li><strong>Notification and delivery tracking testing.</strong></li>
                                                <li><strong>Admin panel management testing.</strong></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="key-achievements">
                                        <div className="key-achievements-group">
                                            <label>Key Achievements:</label>
                                            <ul>
                                                <li><strong>Supported stable App Store & Play Store launches.</strong></li>
                                                <li><strong>Resolved major photo upload and payment issues.</strong></li>
                                                <li><strong>Improved order success through regression testing.</strong></li>
                                                <li><strong>Contributed to release certification.</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 4 */}
                                <div className="card">
                                    <div className="card-header">
                                        <div className="wave-bg">
                                            <h1 className="wave-title">
                                                Kinzwin - Multiplayer Gaming Platform
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="stats">
                                        <label>Domain:</label>
                                        <strong>Gaming / Multiplayer / Social Platform</strong>

                                        <label>Platform:</label>
                                        <strong>Android, iOS, Web Admin</strong>

                                        <label>Role:</label>
                                        <strong>Manual QA Engineer</strong>
                                    </div>

                                    <div className="form">
                                        <div className="form-group">
                                            <label>Overview:</label>
                                            <strong>
                                                Kinzwin is a competitive multiplayer gaming platform offering
                                                casual and skill-based games with social engagement and real-time
                                                competition.
                                            </strong>
                                        </div>

                                        <div className="form-group">
                                            <label>Key Testing Areas:</label>
                                            <strong>
                                                Gameplay, multiplayer sync, chat, leaderboards, fair play, and
                                                admin panel validation.
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="responsibilities">
                                        <div className="responsibilities-group">
                                            <label>Responsibilities:</label>
                                            <ul>
                                                <li><strong>Gameplay and scoring validation.</strong></li>
                                                <li><strong>Multiplayer synchronization testing.</strong></li>
                                                <li><strong>Chat module testing.</strong></li>
                                                <li><strong>Leaderboard verification.</strong></li>
                                                <li><strong>Fair play validation.</strong></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="key-achievements">
                                        <div className="key-achievements-group">
                                            <label>Key Achievements:</label>
                                            <ul>
                                                <li><strong>Zero critical production defects at launch.</strong></li>
                                                <li><strong>Resolved multiplayer sync issues pre-release.</strong></li>
                                                <li><strong>Improved user engagement and stability.</strong></li>
                                                <li><strong>Supported final certification.</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 5 */}
                                <div className="card">
                                    <div className="card-header">
                                        <div className="wave-bg">
                                            <h1 className="wave-title">
                                                reGive - Sustainability & Community Sharing Application
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="stats">
                                        <label>Domain:</label>
                                        <strong>Sustainability / Social Impact</strong>

                                        <label>Platform:</label>
                                        <strong>Android, iOS, Web Admin</strong>

                                        <label>Role:</label>
                                        <strong>Manual QA Engineer</strong>
                                    </div>

                                    <div className="form">
                                        <div className="form-group">
                                            <label>Overview:</label>
                                            <strong>
                                                reGive enables local community gifting to reduce waste through
                                                secure exchanges, one-click gifting, and pickup coordination.
                                            </strong>
                                        </div>

                                        <div className="form-group">
                                            <label>Key Testing Areas:</label>
                                            <strong>
                                                Item listing, gifting flow, pickup scheduling, chat, ratings,
                                                notifications, and admin moderation.
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="responsibilities">
                                        <div className="responsibilities-group">
                                            <label>Responsibilities:</label>
                                            <ul>
                                                <li><strong>Item listing and gifting workflow testing.</strong></li>
                                                <li><strong>Chat and interaction verification.</strong></li>
                                                <li><strong>Pickup scheduling validation.</strong></li>
                                                <li><strong>Ratings and feedback testing.</strong></li>
                                                <li><strong>Notification verification.</strong></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="key-achievements">
                                        <div className="key-achievements-group">
                                            <label>Key Achievements:</label>
                                            <ul>
                                                <li><strong>Zero critical defects at launch.</strong></li>
                                                <li><strong>Resolved major gifting and chat issues.</strong></li>
                                                <li><strong>Improved reliability via negative testing.</strong></li>
                                                <li><strong>Supported final UAT approval.</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </section>
                </section>
            </section>
        </>
    );
}
