import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Quick check: if user just logged in, trust for first few seconds
      const justLoggedIn = sessionStorage.getItem("admin-just-logged-in");
      if (justLoggedIn && Date.now() - Number(justLoggedIn) < 5000) {
        sessionStorage.removeItem("admin-just-logged-in");
        if (isMounted) {
          setIsAuth(true);
          setIsChecking(false);
        }
        return;
      }

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
          if (process.env.NODE_ENV === "development") {
            console.log("Profile check success:", data);
          }
          setIsAuth(true);
        } else {
          const errorText = await res.text();
          if (process.env.NODE_ENV === "development") {
            console.log("Profile check failed:", res.status, errorText);
          }

          // Retry logic for temporary failures (e.g. cookie not yet sent)
          if (retryCount < MAX_RETRIES && (res.status === 401 || res.status === 0)) {
            setRetryCount(prev => prev + 1);
            setTimeout(checkAuth, 800 * (retryCount + 1)); // exponential backoff
            return;
          }

          setIsAuth(false);
        }
      } catch (err) {
        if (isMounted) {
          if (process.env.NODE_ENV === "development") {
            console.error("Profile fetch error:", err);
          }
          // Retry on network errors
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setTimeout(checkAuth, 800 * (retryCount + 1));
            return;
          }
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
  }, [retryCount]);

  if (isChecking) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Authenticating... Please wait</p>
      </div>
    );
  }

  if (isAuth === false) {
    if (process.env.NODE_ENV === "development") {
      console.log("Redirecting to login — not authenticated");
    }
    return <Navigate to="/admin/login" replace />;
  }

  // isAuth === true
  return children;
};

export default ProtectedRoute;