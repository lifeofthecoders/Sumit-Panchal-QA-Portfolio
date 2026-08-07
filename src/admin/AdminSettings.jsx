import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/css/admin-settings.css";
import { useToast } from "../components/ToastProvider";
import { authFetch } from "../utils/authFetch";

const AdminSettings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleReset = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    // ✅ NEW: Prevent same old and new password
    if (oldPassword === newPassword) {
      showToast("New password must be different from old password", "error");
      return;
    }

    // ✅ NEW: Prevent all three being same
    if (
      oldPassword === newPassword &&
      newPassword === confirmPassword
    ) {
      showToast("All passwords cannot be the same", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await authFetch("/api/admin/change-password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password change failed");
      }

      showToast("Password updated successfully!", "success");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      showToast(err.message || "Error updating password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-settings-page fade-in">

      <div className="admin-settings-card">
        <h2 className="admin-settings-title">Reset Password</h2>
        <p className="admin-settings-subtitle">
          Please enter your old password and choose a new password.
        </p>

        <div className="admin-form-group">
          <label>* Old Password</label>
          <div className="admin-password-wrapper">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="admin-password-input"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="admin-eye-btn"
            >
              {showOld ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="admin-form-group">
          <label>* New Password</label>
          <div className="admin-password-wrapper">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="admin-password-input"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="admin-eye-btn"
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="admin-form-group">
          <label>* Confirm Password</label>
          <div className="admin-password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="admin-password-input"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="admin-eye-btn"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className={`admin-reset-btn bounce-hover ${loading ? "loading" : ""}`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;