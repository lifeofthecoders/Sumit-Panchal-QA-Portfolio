
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";

import API_BASE_URL from "../config/api";
import { useToast } from "../components/ToastProvider";

import "../assets/css/admin-login.css";

import logoSrc from "/image/logo.svg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const resetToken = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resetToken || !/^[a-fA-F0-9]{64}$/.test(resetToken)) {
      setError(
        "This password reset link is invalid. Please request a new reset link."
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please complete both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm New Password do not match.");
      return;
    }

    // bcrypt only supports passwords up to 72 UTF-8 bytes.
    const passwordBytes = new TextEncoder().encode(newPassword).length;

    if (passwordBytes > 72) {
      setError("Your password must not exceed 72 UTF-8 bytes.");
      return;
    }

    setError("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token: resetToken,
            newPassword,
            confirmPassword,
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

      if (!response.ok || data.success !== true) {
        throw new Error(
          data.message || "Unable to reset your password. Please try again."
        );
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      showToast(
        "Your administrator password has been reset successfully.",
        "success"
      );
    } catch (err) {
      const message =
        err.name === "AbortError"
          ? "The request timed out. Please try again."
          : err.message?.includes("Failed to fetch")
          ? "Unable to connect to the server. Please try again later."
          : err.message || "Something went wrong. Please try again.";

      setError(message);
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

        {/* Reset Password Section */}
        <div className="login-panel forgot-password-panel">

          <div className="forgot-password-icon">
            {success ? <FaCheckCircle /> : <FaShieldAlt />}
          </div>

          <h2 className="welcome-title">
            Reset <span className="highlight">Password</span>
          </h2>

          <p className="welcome-subtitle">
            {success
              ? "Your administrator password has been updated successfully."
              : "Create a new password for your administrator account. Enter your new password below and confirm it to continue."}
          </p>

          {!success ? (
            <>
              {!resetToken && (
                <div className="error-alert" role="alert">
                  This password reset link is missing or invalid.
                  Please request a new password reset link.
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="login-form"
              >
                {error && (
                  <div className="error-alert" role="alert">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div className="form-group">
                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <div className="input-wrapper">
                    <FaLock className="field-icon" />

                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                      autoFocus
                      required
                      disabled={loading || !resetToken}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowNewPassword((previous) => !previous)
                      }
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      aria-pressed={showNewPassword}
                      disabled={loading}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group">
                  <label htmlFor="confirm-password">
                    Confirm New Password
                  </label>

                  <div className="input-wrapper">
                    <FaLock className="field-icon" />

                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                      required
                      disabled={loading || !resetToken}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      aria-pressed={showConfirmPassword}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading || !resetToken}
                >
                  {loading ? (
                    <span className="forgot-loading">
                      <span className="spinner" />
                      Resetting Password...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="forgot-success-section">
              <div
                className="success-alert"
                role="status"
                aria-live="polite"
              >
                <strong>Password Reset Successful!</strong>

                <p>
                  Your administrator password has been changed.
                  Your previous password can no longer be used to
                  access your account. Please log in using your
                  new password.
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

export default ResetPassword;
