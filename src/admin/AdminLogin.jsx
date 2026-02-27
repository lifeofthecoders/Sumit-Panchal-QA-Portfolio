import React, { useState } from "react";
import Login from "@react-login-page/page3";
import "@react-login-page/page3/dist/index.css";
import "./admin-login.css";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }) => {
    try {
      setError("");
      setLoading(true);

      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔐 Important for JWT cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Successful login
      navigate("/admin/blogs");

    } catch (err) {
      setError(err.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page3">
      <Login
        onSubmit={handleLogin}
        style={{ height: "100vh" }}
      >
        <Login.Logo>🛡️</Login.Logo>

        <Login.Title>Admin Login</Login.Title>

        <Login.Welcome>
          Welcome back! Log in to your admin account.
        </Login.Welcome>

        <Login.Email name="email" />

        <Login.Password name="password" />

        <Login.ButtonAfter>
          {loading && (
            <p style={{ color: "#333" }}>Authenticating...</p>
          )}
          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}
        </Login.ButtonAfter>
      </Login>
    </div>
  );
};

export default AdminLogin;