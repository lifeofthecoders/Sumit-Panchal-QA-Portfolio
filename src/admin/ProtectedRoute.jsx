
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState("checking");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const verifySession = async () => {
      const token = localStorage.getItem("admin-token");

      if (!token) {
        if (isMounted) {
          setStatus("unauthorized");
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!isMounted) return;

        if (response.status === 401) {
          localStorage.removeItem("admin-token");
          setStatus("unauthorized");
          return;
        }

        if (response.status === 503) {
          setStatus("unavailable");
          return;
        }

        if (!response.ok) {
          setStatus("unavailable");
          return;
        }

        const result = await response.json();

        if (!isMounted) return;

        if (result?.success === true && result?.data) {
          setStatus("authorized");
        } else {
          setStatus("unavailable");
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Admin session verification failed:", error);

        if (isMounted) {
          setStatus("unavailable");
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [retryCount]);

  // Never render protected content before backend verification.
  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          background: "#f8fafc",
          color: "#334155",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#0016EC",
            borderRadius: "50%",
            animation: "adminRouteSpin 0.8s linear infinite",
          }}
        />

        <p>Verifying administrator access...</p>

        <style>
          {`
            @keyframes adminRouteSpin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // Invalid, expired or missing credentials.
  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  // Backend unavailable: fail closed, but allow retry.
  if (status === "unavailable") {
    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "14px",
          padding: "24px",
          textAlign: "center",
          background: "#f8fafc",
          color: "#334155",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Unable to verify administrator access</h2>

        <p>
          The authentication service is currently unavailable.
          Your admin panel remains protected.
        </p>

        <button
          type="button"
          onClick={() => {
            setStatus("checking");
            setRetryCount((count) => count + 1);
          }}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#0016EC",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Retry verification
        </button>
      </div>
    );
  }

  // Only a backend-verified session can render admin content.
  return children;
};

export default ProtectedRoute;
