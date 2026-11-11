
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaArrowLeft,
  FaShieldAlt,
} from "react-icons/fa";

import API_BASE_URL from "../config/api";
import { useToast } from "../components/ToastProvider";

import "../assets/css/admin-login.css";

import logoSrc from "/image/logo.svg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    // Required email validation
    if (!normalizedEmail) {
      showToast(
        "Please enter your registered email address.",
        "error"
      );
      return;
    }

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      showToast(
        "Please enter a valid email address.",
        "error"
      );
      return;
    }

    setLoading(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
          signal: controller.signal,
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Handle unregistered email explicitly.
      if (data.code === "ADMIN_EMAIL_NOT_FOUND") {
        throw new Error(
          data.message ||
            "This email address is not registered with the administrator account."
        );
      }

      // Handle email delivery failures.
      if (data.code === "RESET_EMAIL_DELIVERY_FAILED") {
        throw new Error(
          data.message ||
            "Unable to send the password reset email. Please try again later."
        );
      }

      // Handle all other API errors.
      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message ||
            "Unable to process your request. Please try again."
        );
      }

      // Only accept an explicitly confirmed email delivery response.
      if (
        data.code !== "RESET_EMAIL_SENT" ||
        data.emailSent !== true
      ) {
        throw new Error(
          "The password reset email could not be confirmed. Please try again."
        );
      }

      setSuccess(true);

      showToast(
        "Password reset instructions have been sent to your registered email address.",
        "success"
      );
    } catch (err) {
      let message;

      if (err.name === "AbortError") {
        message = "The request timed out. Please try again.";
      } else if (
        err.message?.includes("Failed to fetch")
      ) {
        message =
          "Unable to connect to the server. Please try again later.";
      } else {
        message =
          err.message ||
          "Something went wrong. Please try again.";
      }

      // All validation and API errors use toast notifications only.
      showToast(message, "error");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card forgot-password-card">

        {/* Branding Section */}
        <div className="branding-panel">
          <img
            src={logoSrc}
            alt="Sumit Panchal Quality Assurance Logo"
            className="portal-logo"
          />

          <div className="brand-name-stack">
            <div className="brand-line name">
              SUMIT PANCHAL
            </div>

            <div className="brand-line role">
              QUALITY ASSURANCE
            </div>

            <div className="brand-line access">
              ADMINISTRATION PORTAL
            </div>

            <div className="brand-line motto">
              Precision in Every Detail.
              Quality in Every Release.
            </div>
          </div>
        </div>

        {/* Forgot Password Section */}
        <div className="login-panel forgot-password-panel">

          <div className="forgot-password-icon">
            <FaShieldAlt />
          </div>

          <h2 className="welcome-title">
            Forgot <span className="highlight">Password?</span>
          </h2>

          <p className="welcome-subtitle">
            Please enter your registered administrator email
            address and we'll send you a secure password reset link.
          </p>

          {!success ? (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="login-form"
            >
              <div className="form-group">
                <label htmlFor="recovery-email">
                  Registered Email Address
                </label>

                <div className="input-wrapper">
                  <FaEnvelope className="field-icon" />

                  <input
                    id="recovery-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="forgot-loading">
                    <span className="spinner" />
                    Sending Reset Link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="forgot-success-section">
              <div className="success-alert" role="status">
                <strong>
                  Request submitted successfully!
                </strong>

                <p>
                  A password reset link has been sent to your
                  registered email address. Please check your
                  inbox and follow the instructions to reset
                  your password.
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            className="back-to-login"
            onClick={() => navigate("/admin/login")}
            disabled={loading}
          >
            <FaArrowLeft />
            <span>Admin Login</span>
          </button>

          <p className="access-note">
            Secure Administrator Account Recovery
          </p>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
