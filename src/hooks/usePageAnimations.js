import { useEffect } from "react";

export default function usePageAnimations() {
  useEffect(() => {
    // ===== Anchor Link Copy =====
    document.querySelectorAll(".anchor-icon").forEach(icon => {
      icon.onclick = e => {
        e.preventDefault();
        const href = icon.getAttribute("href");
        const id = href?.replace("#", "");

        if (!id) return;

        const base = window.location.origin + window.location.pathname;

        const fullURL = `${base}#/#${id}`;

        navigator.clipboard.writeText(fullURL);


        navigator.clipboard.writeText(fullURL);

        const original = icon.innerText;
        icon.innerText = "✅";
        setTimeout(() => (icon.innerText = original), 1200);
      };
    });

    // ===== Intersection Observer =====
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    document
      .querySelectorAll(
        ".hero-animate h1, .hero-animate h2, .profile-slide, .animate-content, .logo-slide"
      )
      .forEach(el => observer.observe(el));

    // ===== Logo Scroll Re-trigger =====
    const logo = document.querySelector(".logo-slide");
    let lastScrollY = window.scrollY;

    const triggerLogoAnimation = () => {
      if (!logo) return;
      logo.classList.remove("animate");
      void logo.offsetWidth;
      logo.classList.add("animate");
    };

    window.addEventListener("load", triggerLogoAnimation);
    window.addEventListener("scroll", () => {
      const current = window.scrollY;
      if (Math.abs(current - lastScrollY) > 10) {
        triggerLogoAnimation();
        lastScrollY = current;
      }
    });

    return () => observer.disconnect();
  }, []);
}
