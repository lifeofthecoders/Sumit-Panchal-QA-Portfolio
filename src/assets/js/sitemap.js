(function () {

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
            } else {
                entry.target.classList.remove("in-view"); // replay on scroll
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: "0px 0px -10% 0px"
    });

    // Observe ONLY what needs animation
    document.querySelectorAll(
        ".hero-animate h1, .hero-animate h2, .animate-content"
    ).forEach(el => observer.observe(el));

})();

/* ==========================================
   LOGO — SCROLL UP / DOWN RE-ANIMATION
   ========================================== */

(() => {
    const logo = document.querySelector(".logo-slide");
    if (!logo) return;

    let lastScrollY = window.scrollY;

    function restartLogoAnimation() {
        logo.classList.remove("animate");
        void logo.offsetWidth; // force reflow
        logo.classList.add("animate");
    }

    // Run once on page load
    window.addEventListener("load", restartLogoAnimation);

    // Re-trigger on scroll up or down
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;

        if (Math.abs(currentScroll - lastScrollY) > 12) {
            restartLogoAnimation();
            lastScrollY = currentScroll;
        }
    });
})();
