import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { useToast } from "../components/ToastProvider";

// React Icons
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Logo import
import logoSrc from "/image/logo.svg";

import "./admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password", "error");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // ✅ Safely parse response
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Authentication failed. Please try again."
        );
      }

      // ✅ Ensure token exists
      if (!data.token) {
        throw new Error("Authentication token not received from server.");
      }

      localStorage.setItem("admin-token", data.token);

      showToast("Login successful! Redirecting...", "success");

      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 800);

    } catch (err) {
      showToast(
        err.message || "Login failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
          <p className="welcome-subtitle">
            Log in to manage your portfolio
          </p>

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
                  autoComplete="email"
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
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
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