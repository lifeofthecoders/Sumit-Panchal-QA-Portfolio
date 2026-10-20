import { useEffect } from "react";

export default function useInViewAnimation(selector) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll(selector).forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [selector]);
}
