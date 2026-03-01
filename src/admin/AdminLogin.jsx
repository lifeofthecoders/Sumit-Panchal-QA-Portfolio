import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { useToast } from "../components/ToastProvider";

import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import logoSrc from "/image/logo.svg";

import "./admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("admin-token", data.token);

      showToast("Login successful!", "success");

      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 800);

    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="branding-panel">
          <img src={logoSrc} alt="Logo" className="portal-logo" />
        </div>

        <div className="login-panel">
          <h2>Admin Login</h2>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <FaEnvelope />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;