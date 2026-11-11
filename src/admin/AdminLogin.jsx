
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { BACKEND_ASSET_BASE_URL } from "../config/api";
import { useToast } from "../components/ToastProvider";

// React Icons
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Logo import
import logoSrc from "/image/logo.svg";

import "../assets/css/admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [backendCheckLoading, setBackendCheckLoading] = useState(true);

  /* =========================
     ADMIN LOGIN
  ========================= */
  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      showToast("Please enter both email and password", "error");
      return;
    }

    if (!backendHealthy && !backendCheckLoading) {
      showToast(
        "Backend server is unavailable. Please wait and try again later.",
        "error"
      );
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
        signal: controller.signal,
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password. Please try again."
        );
      }

      if (
        data.success !== true ||
        typeof data.token !== "string" ||
        !data.token
      ) {
        throw new Error(
          "Authentication token was not received from the server."
        );
      }

      // Store the newly issued database-backed JWT.
      localStorage.removeItem("admin-token");
      localStorage.setItem("admin-token", data.token);

      // Retrieve the authenticated administrator's profile.
      const profileResponse = await fetch(
        `${API_BASE_URL}/api/admin/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );

      let profileResult = {};

      try {
        profileResult = await profileResponse.json();
      } catch {
        profileResult = {};
      }

      if (!profileResponse.ok || profileResult.success !== true) {
        localStorage.removeItem("admin-token");

        throw new Error(
          profileResult.message ||
            "Unable to verify administrator account. Please log in again."
        );
      }

      const admin = profileResult.data;

      if (!admin || !admin._id || !admin.email) {
        localStorage.removeItem("admin-token");

        throw new Error(
          "Administrator profile verification failed."
        );
      }

      // Store non-sensitive profile information for existing UI components.
      localStorage.setItem("adminName", admin.name || "Admin");
      localStorage.setItem("adminEmail", admin.email);

      let avatar = admin.profilePic;

      if (avatar && !avatar.startsWith("http")) {
        avatar = `${BACKEND_ASSET_BASE_URL}${avatar}`;
      }

      localStorage.setItem(
        "adminAvatar",
        avatar ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      );

      window.dispatchEvent(new Event("admin-data-updated"));

      const successMessage = "Login successful! Redirecting...";

      setPassword("");
      showToast(successMessage, "success");

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (err) {
      const networkMessage =
        err.message &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError"));

      const message =
        err.name === "AbortError"
          ? "Server is taking too long to respond. Please try again later."
          : networkMessage
          ? "Cannot reach backend server. Please check the server status or your network."
          : err.message || "Login failed. Please try again.";

      setPassword("");
      showToast(message, "error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  /* =========================
     FORGOT PASSWORD
  ========================= */
  const handleForgotPassword = () => {
    navigate("/admin/forgot-password");
  };

  /* =========================
     BACKEND HEALTH CHECK
  ========================= */
  const checkBackendHealth = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Health check failed");
      }

      const data = await response.json();

      if (!data?.ok) {
        throw new Error(
          data.message || "Health endpoint returned an error"
        );
      }

      setBackendHealthy(true);
    } catch (err) {
      setBackendHealthy(false);
    } finally {
      clearTimeout(timeoutId);
      setBackendCheckLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Left - Branding Section */}
        <div className="branding-panel">
          <img
            src={logoSrc}
            alt="Sumit Panchal - QA Portfolio Logo"
            className="portal-logo"
          />

          <div className="brand-name-stack">
            <div className="brand-line elite">Elite Concierge</div>
            <div className="brand-line name">Sumit Panchal</div>
            <div className="brand-line role">QUALITY ASSURANCE</div>
            <div className="brand-line access">
              Access granted to the discerning.
            </div>
            <div className="brand-line motto">
              Precision. Permanence. Privilege.
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="login-panel">
          <h2 className="welcome-title">
            Welcome to <span className="highlight">Admin Panel</span>
          </h2>

          <form onSubmit={handleLogin} noValidate className="login-form">

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <div className="input-wrapper">
                <FaEnvelope className="field-icon" />

                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <FaLock className="field-icon" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Forgot Password - Admin Login Only */}
              <div className="forgot-password-row">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={
                loading ||
                backendCheckLoading ||
                !backendHealthy
              }
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="access-note">
            Admin access only. Contact support if you need help.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
