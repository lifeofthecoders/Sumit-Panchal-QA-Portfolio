document.querySelectorAll(".anchor-icon").forEach(icon => {
  icon.addEventListener("click", function (e) {
    e.preventDefault();

    const id = this.getAttribute("data-target");
    const fullURL = window.location.origin + window.location.pathname + "#" + id;

    navigator.clipboard.writeText(fullURL);

    this.innerText = "✅"; // visual feedback
    setTimeout(() => {
      this.innerText = "🔗";
    }, 1200);
  });
});

(function () {

  const observerOptions = { threshold: 0.10 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      } else {
        entry.target.classList.remove("in-view");
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    ".hero-animate, .animate-content, .hero-animate h1, .hero-animate h2"
  );


  animatedElements.forEach(el => observer.observe(el));

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
