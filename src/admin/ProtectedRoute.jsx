import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Give the browser ~300–600 ms to actually store the cookie
      await new Promise(resolve => setTimeout(resolve, 600));

      if (!isMounted) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          console.log("Profile check success:", data);
          setIsAuth(true);
        } else {
          const errorText = await res.text();
          console.log("Profile check failed:", res.status, errorText);
          setIsAuth(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Profile fetch error:", err);
          setIsAuth(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // ────────────────────────────────────────────────
  // Rendering logic
  // ────────────────────────────────────────────────

  if (isChecking) {
    return (
      <div style={{
        padding: "80px 20px",
        textAlign: "center",
        fontSize: "1.2rem",
        color: "#666"
      }}>
        Authenticating... please wait
      </div>
    );
  }

  if (isAuth === false) {
    console.log("Redirecting to login — not authenticated");
    return <Navigate to="/admin/login" replace />;
  }

  // isAuth === true
  return children;
};

export default ProtectedRoute;