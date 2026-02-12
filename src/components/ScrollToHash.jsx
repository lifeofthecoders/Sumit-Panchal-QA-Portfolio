import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    // Extract ID from hash formats:
    // Format 1: #/page#id (when navigating from different page)
    // Format 2: #id (when on same page with direct anchor)
    let id = hash;
    
    // Remove leading # if present
    if (id.startsWith("#")) {
      id = id.substring(1);
    }
    
    // Remove route path if present (e.g., "/blogs")
    const lastHashIndex = id.lastIndexOf("#");
    if (lastHashIndex > 0) {
      id = id.substring(lastHashIndex + 1);
    } else if (id.startsWith("/")) {
      // If it starts with /, remove the entire route path
      const parts = id.split("#");
      id = parts[1] || "";
    }

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, [hash]);

  return null;
}
