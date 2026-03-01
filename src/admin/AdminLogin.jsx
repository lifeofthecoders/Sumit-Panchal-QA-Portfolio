import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

// React Icons
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Logo import
import logoSrc from "/image/logo.svg";

import "./admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      setSuccessMsg("Login successful! Redirecting...");
      localStorage.setItem("admin-just-logged-in", Date.now().toString());

      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 800);

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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
            <div className="brand-line access">Access granted to the discerning.</div>
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

          {error && <div className="error-alert">{error}</div>}
          {successMsg && <div className="success-alert">{successMsg}</div>}

          <form onSubmit={handleLogin} noValidate className="login-form">
            <div className="form-group fade-item" style={{ animationDelay: "0.4s" }}>
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="field-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group fade-item" style={{ animationDelay: "0.55s" }}>
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
              className="submit-button fade-item"
              disabled={loading}
              style={{ animationDelay: "0.7s" }}
            >
              {loading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
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