import React, { useState } from "react";
import "./admin-login.css";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      // Prefer env var, but on production builds always use the deployed endpoint.
      const baseUrl = import.meta.env.VITE_API_BASE_URL
        || (import.meta.env.MODE === 'production'
            ? "https://sumit-panchal-qa-portfolio.onrender.com"
            : "http://localhost:5000");

      console.log("BASE URL =", baseUrl);

      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Required for JWT cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid Email or Password");
      }

      // ✅ Successful login
      navigate("/admin/blogs");

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="left-panel">
          <div className="brand">L</div>
        </div>

        <div className="right-panel">
          <h2 className="title">We are <span className="highlight">Login</span></h2>
          <p className="welcome-text">Welcome back! Log in to your account.</p>

          <div className="form-field">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-action">
            <button className="pill-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Log in"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;