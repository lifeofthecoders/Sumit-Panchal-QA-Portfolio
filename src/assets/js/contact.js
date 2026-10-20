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
    ".animate-title, .animate-content, .hero-animate h1, .hero-animate h2, .profile-slide"
  );



  animatedElements.forEach(el => observer.observe(el));

})();

/* ==========================================
LOGO — MOBILE-SAFE SCROLL REPLAY
========================================== */

(() => {
  const logo = document.querySelector(".logo-slide");
  if (!logo) return;

  function replayLogo() {
    // hard reset animation (mobile safe)
    logo.classList.remove("logo-animate");
    logo.style.animation = "none";

    // force reflow (CRITICAL)
    void logo.offsetHeight;

    logo.style.animation = "";
    logo.classList.add("logo-animate");
  }

  // initial animation
  window.addEventListener("load", replayLogo);

  // replay on scroll
  let lastY = window.scrollY;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) > 8) {
      replayLogo();
      lastY = y;
    }
  });
})();
