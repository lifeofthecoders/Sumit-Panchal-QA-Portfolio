import { useCallback, useEffect, useRef, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import {
  useLocation,
  useNavigate,
  useNavigationType,
  useSearchParams,
} from "react-router-dom";
import { referenceProjects } from "../assets/js/projects";
import "../assets/css/projects.css";

const headingAnchorUrl = `${window.location.origin}${window.location.pathname}#/projects#my-projects`;

function scrollShowcasePage(top) {
  document.body.scrollTo({ top, behavior: "auto" });
  document.documentElement.scrollTo({ top, behavior: "auto" });
  window.scrollTo({ top, behavior: "auto" });
}

export default function Projects() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const previousProjectIdRef = useRef(null);
  const listingScrollTopRef = useRef(0);
  const [anchorCopied, setAnchorCopied] = useState(false);
  const [copiedSectionAnchor, setCopiedSectionAnchor] = useState(null);
  const selectedProjectId = searchParams.get("project");
  const selectedProject = referenceProjects.find(
    (project) => String(project.id) === selectedProjectId
  );

  useEffect(() => {
    const animatedElements = document.querySelectorAll(
      ".hero-animate h1, .hero-animate h2, .profile-slide, .reference-projects-intro"
    );

    const logo = document.querySelector(".logo-slide");
    let lastScrollY = Math.max(
      document.body.scrollTop,
      document.documentElement.scrollTop,
      window.scrollY
    );
    const restartLogoAnimation = () => {
      if (!logo) return;
      logo.classList.remove("animate");
      void logo.offsetWidth;
      logo.classList.add("animate");
    };
    const updateAnimatedElements = () => {
      const viewportHeight = window.innerHeight;
      animatedElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(bounds.bottom, viewportHeight) - Math.max(bounds.top, 0)
        );
        element.classList.toggle(
          "in-view",
          bounds.height > 0 && visibleHeight / bounds.height >= 0.1
        );
      });
    };
    const handleScroll = () => {
      updateAnimatedElements();
      const currentScrollY = Math.max(
        document.body.scrollTop,
        document.documentElement.scrollTop,
        window.scrollY
      );
      if (Math.abs(currentScrollY - lastScrollY) > 12) {
        restartLogoAnimation();
        lastScrollY = currentScrollY;
      }
    };
    restartLogoAnimation();
    updateAnimatedElements();
    window.addEventListener("scroll", handleScroll, true);
    document.body.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.body.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      scrollShowcasePage(0);
      if (
        navigationType !== "POP" &&
        location.state?.fromProjectShowcase
      ) {
        closeButtonRef.current?.focus({ preventScroll: true });
      }
    } else if (previousProjectIdRef.current) {
      scrollShowcasePage(listingScrollTopRef.current);
      window.requestAnimationFrame(() => {
        document
          .querySelector(`[data-project-id="${previousProjectIdRef.current}"]`)
          ?.focus({ preventScroll: true });
      });
    }

    previousProjectIdRef.current = selectedProjectId;
  }, [location.state, navigationType, selectedProjectId]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  const openProject = (project) => {
    listingScrollTopRef.current = Math.max(
      document.body.scrollTop,
      document.documentElement.scrollTop,
      window.scrollY
    );
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("view");
    nextSearchParams.set("project", String(project.id));
    navigate(
      {
        pathname: location.pathname,
        search: `?${nextSearchParams.toString()}`,
      },
      { state: { fromProjectShowcase: true } }
    );
  };

  const closeProject = useCallback(() => {
    if (!selectedProjectId || isClosing) return;

    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      if (location.state?.fromProjectShowcase) {
        navigate(-1);
        return;
      }

      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("project");
      nextSearchParams.delete("view");
      navigate(
        {
          pathname: location.pathname,
          search: `?${nextSearchParams.toString()}`,
        },
        { replace: true, state: null }
      );
    }, 300);
  }, [
    isClosing,
    location.pathname,
    location.state,
    navigate,
    searchParams,
    selectedProjectId,
  ]);

  useEffect(() => {
    if (!selectedProjectId || !selectedProject) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeProject();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeProject, selectedProject, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) return;

    setIsClosing(false);
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, [selectedProjectId]);

  const handleCardPointerMove = (event) => {
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - bounds.top}px`);
  };

  const copyProjectsAnchor = async (event) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(headingAnchorUrl);
      setAnchorCopied(true);
      window.setTimeout(() => setAnchorCopied(false), 1200);
    } catch (error) {
      console.error("Unable to copy the Projects section link:", error);
    }
  };

  const copySectionAnchor = async (event, anchorId) => {
    event.preventDefault();
    const sectionAnchorUrl = `${window.location.origin}${window.location.pathname}#/projects?project=${selectedProjectId}#${anchorId}`;
    try {
      await navigator.clipboard.writeText(sectionAnchorUrl);
      setCopiedSectionAnchor(anchorId);
      window.setTimeout(() => setCopiedSectionAnchor(null), 1200);
    } catch (error) {
      console.error("Unable to copy the project section link:", error);
    }
  };

  if (selectedProjectId && !selectedProject) {
    return (
      <main className="reference-projects reference-projects-not-found">
        <div className="reference-projects-inner">
          <p className="reference-projects-eyebrow">QA PROJECT</p>
          <h1>Project not found</h1>
          <button
            className="reference-project-back"
            onClick={() => {
              const nextSearchParams = new URLSearchParams(searchParams);
              nextSearchParams.delete("project");
              nextSearchParams.delete("view");
              navigate(
                {
                  pathname: location.pathname,
                  search: `?${nextSearchParams.toString()}`,
                },
                { replace: true, state: null }
              );
            }}
            type="button"
          >
            ← Back to Projects
          </button>
        </div>
      </main>
    );
  }

  if (selectedProject) {
    const detailClassName = [
      "reference-project-detail",
      isClosing ? "is-closing" : "is-entering",
    ].join(" ");

    return (
      <main className="reference-projects reference-projects-detail">
        <div className={detailClassName} key={selectedProject.id}>
          <div className="reference-project-detail-heading">
            <button
              ref={closeButtonRef}
              className="reference-project-back"
              disabled={isClosing}
              onClick={closeProject}
              type="button"
            >
              ← Back to Projects
            </button>
            <div className="reference-project-heading">
              <h3
                className="reference-project-detail-label heading-link"
                id="qa-project"
              >
                <b>🧪 QA PROJECT</b>
                <a
                  aria-label="Copy link to QA Project"
                  className="anchor-icon"
                  href="#qa-project"
                  onClick={(event) => copySectionAnchor(event, "qa-project")}
                >
                  {copiedSectionAnchor === "qa-project" ? "✅" : "🔗"}
                </a>
              </h3>
              <h1>{selectedProject.title}</h1>
            </div>
          </div>

          <div className="reference-project-banner">
            <img
              src={selectedProject.bannerImage || selectedProject.image}
              alt={`${selectedProject.title} project banner`}
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <div className="reference-project-detail-content">
            <dl className="reference-project-metadata">
              {[
                ["Domain", selectedProject.domain],
                ["Platform", selectedProject.platform],
                ["Role", selectedProject.role],
              ].map(([label, value]) => (
                <div className="reference-project-meta-card" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <hr className="view-line reference-project-divider" />

            <section className="reference-project-section">
              <h3
                className="reference-project-section-title heading-link"
                id="project-overview"
              >
                <b>👁️ OVERVIEW</b>
                <a
                  aria-label="Copy link to Overview"
                  className="anchor-icon"
                  href="#project-overview"
                  onClick={(event) =>
                    copySectionAnchor(event, "project-overview")
                  }
                >
                  {copiedSectionAnchor === "project-overview" ? "✅" : "🔗"}
                </a>
              </h3>
              <p>{selectedProject.overview}</p>
            </section>

            <hr className="view-line reference-project-divider" />

            {selectedProject.detailImages?.length > 0 && (
              <>
                <section className="reference-project-section">
                  <h3
                    className="reference-project-section-title heading-link"
                    id="project-screens"
                  >
                    <b>🖼️ PROJECT SCREENS &amp; KEY WORKFLOWS</b>
                    <a
                      aria-label="Copy link to Project Screens & Key Workflows"
                      className="anchor-icon"
                      href="#project-screens"
                      onClick={(event) =>
                        copySectionAnchor(event, "project-screens")
                      }
                    >
                      {copiedSectionAnchor === "project-screens" ? "✅" : "🔗"}
                    </a>
                  </h3>
                  <div className="reference-project-gallery">
                    {selectedProject.detailImages.map((image) => (
                      <figure key={image.src}>
                        <div className="reference-project-gallery-frame">
                          <img
                            className={
                              image.fit === "contain"
                                ? "is-contain"
                                : image.fit === "stretch"
                                  ? "is-stretched"
                                  : ""
                            }
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <figcaption>{image.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
                <hr className="view-line reference-project-divider" />
              </>
            )}

            {selectedProject.testingAreas?.length > 0 && (
              <>
                <section className="reference-project-section">
                  <h3
                    className="reference-project-section-title heading-link"
                    id="key-testing-areas"
                  >
                    <b>🧪 KEY TESTING AREAS</b>
                    <a
                      aria-label="Copy link to Key Testing Areas"
                      className="anchor-icon"
                      href="#key-testing-areas"
                      onClick={(event) =>
                        copySectionAnchor(event, "key-testing-areas")
                      }
                    >
                      {copiedSectionAnchor === "key-testing-areas"
                        ? "✅"
                        : "🔗"}
                    </a>
                  </h3>
                  <ul className="reference-project-tags">
                    {selectedProject.testingAreas.map((area) => (
                      <li key={area}>{area}</li>
                    ))}
                  </ul>
                </section>
                <hr className="view-line reference-project-divider" />
              </>
            )}

            {selectedProject.responsibilities?.length > 0 && (
              <>
                <section className="reference-project-section">
                  <h3
                    className="reference-project-section-title heading-link"
                    id="project-responsibilities"
                  >
                    <b>💼 RESPONSIBILITIES</b>
                    <a
                      aria-label="Copy link to Responsibilities"
                      className="anchor-icon"
                      href="#project-responsibilities"
                      onClick={(event) =>
                        copySectionAnchor(event, "project-responsibilities")
                      }
                    >
                      {copiedSectionAnchor === "project-responsibilities"
                        ? "✅"
                        : "🔗"}
                    </a>
                  </h3>
                  <ul className="reference-project-list skills-list qa-list">
                    {selectedProject.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <hr className="view-line reference-project-divider" />
              </>
            )}

            {selectedProject.achievements?.length > 0 && (
              <section className="reference-project-section">
                <h3
                  className="reference-project-section-title heading-link"
                  id="key-achievements"
                >
                  <b>🏆 KEY ACHIEVEMENTS</b>
                  <a
                    aria-label="Copy link to Key Achievements"
                    className="anchor-icon"
                    href="#key-achievements"
                    onClick={(event) =>
                      copySectionAnchor(event, "key-achievements")
                    }
                  >
                    {copiedSectionAnchor === "key-achievements" ? "✅" : "🔗"}
                  </a>
                </h3>
                <ul className="reference-project-list is-achievement-list skills-list qa-list qa-list--check">
                  {selectedProject.achievements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <a
              className="reference-project-back reference-project-github"
              href={selectedProject.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiExternalLink aria-hidden="true" />
              <span>Explore My GitHub</span>
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="reference-projects reference-projects-listing">
      <div className="reference-projects-inner">
        <header className="reference-projects-intro animate-content in-view">
          <h3
            id="my-projects"
            className="reference-project-showcase-heading heading-link"
          >
            <b>📂 My Projects</b>
            <a
              aria-label="Copy link to My Projects"
              className="reference-project-heading-anchor"
              href={headingAnchorUrl}
              onClick={copyProjectsAnchor}
            >
              {anchorCopied ? "✅" : "🔗"}
            </a>
          </h3>
          <p className="summary-paragraph">
            Explore QA projects across transportation, professional networking,
            gaming, e-commerce, healthcare, and community sharing. Open a
            project to see its platforms, testing coverage, workflows, and
            results.
          </p>
        </header>

        <div
          aria-label="QA project showcase"
          className="reference-project-grid"
        >
          {referenceProjects.map((project, index) => (
            <article
              className="reference-project-card-wrap"
              key={project.id}
              style={{
                "--card-border": project.borderColor,
                "--card-gradient": project.gradient,
                "--card-delay": `${index * 65}ms`,
              }}
            >
              <button
                aria-label={`View ${project.title}`}
                className="reference-project-card"
                data-project-id={project.id}
                onClick={() => openProject(project)}
                onPointerMove={handleCardPointerMove}
                type="button"
              >
                <span className="reference-project-image">
                  <img
                    src={project.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="reference-project-info">
                  <span className="reference-project-name">{project.title}</span>
                  <span className="reference-project-subtitle">
                    {project.subtitle}
                  </span>
                </span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
