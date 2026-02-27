import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

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