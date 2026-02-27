import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Same runtime detection as AdminLogin
        let baseUrl = import.meta.env.VITE_API_BASE_URL || "";
        if (!baseUrl) {
          const host = typeof window !== "undefined" ? window.location.hostname : "";
          if (host.includes("github.io") || host.includes("sumit-panchal-qa-portfolio")) {
            baseUrl = "https://sumit-panchal-qa-portfolio.onrender.com";
          } else {
            baseUrl = "http://localhost:5000";
          }
        }

        const res = await fetch(`${baseUrl}/api/admin/profile`, {
          credentials: "include",
        });

        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) return null;
  if (!isAuth) return <Navigate to="/admin-login" />;

  return children;
};

export default ProtectedRoute;