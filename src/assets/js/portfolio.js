// ================= Anchor Link Icon ================= //
document.querySelectorAll(".anchor-icon").forEach(icon => {
  icon.addEventListener("click", function (e) {
    e.preventDefault();

    const id = this.getAttribute("data-target");
    const fullURL = window.location.origin + window.location.pathname + "#" + id;

    navigator.clipboard.writeText(fullURL);

    const original = this.innerText;
    this.innerText = "✅";
    setTimeout(() => {
      this.innerText = original;
    }, 1200);
  });
});

// ================= HERO + PROFILE ANIMATION OBSERVER ================= //
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const el = entry.target;

    if (entry.isIntersecting) {
      el.classList.add("in-view");   // ✅ MATCHES CSS
    } else {
      el.classList.remove("in-view"); // ✅ allows replay
    }
  });
}, {
  threshold: 0.3,
  rootMargin: "0px 0px -10% 0px"
});

// Observe hero title + profile badge
document.querySelectorAll(
  ".hero-animate h1, .hero-animate h2, .profile-slide, .animate-content"
).forEach(el => observer.observe(el));

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

