import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const { search } = useLocation();

  useEffect(() => {
    if (!search) return;

    // Extract the section ID from query parameters
    const params = new URLSearchParams(search);
    const sectionId = params.get("section");

    if (!sectionId) return;

    // Wait longer to ensure content has loaded before scrolling
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  }, [search]);

  return null;
}
