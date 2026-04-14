import React, { useState, useEffect } from "react";
import "../assets/css/admin-profile.css";
import { authFetch } from "../utils/authFetch";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://sumit-panchal-qa-portfolio.onrender.com";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    emergencyName: "",
    emergencyPhone: "",
    joinedDate: "",
    profilePic: "",
    role: "ADMIN",
    sessions: [],
    activity: [],
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await authFetch("/api/admin/profile", { method: "GET" });

      if (!res.ok) throw new Error("Unauthorized");

      const result = await res.json();
      const data = result.data || result;

      const joinDate = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        : "N/A";

      let avatar = data.profilePic;
      if (avatar && !avatar.startsWith("http")) {
        avatar = `${API_BASE}${avatar}`;
      }
      if (!avatar) avatar = `${API_BASE}/image/profile.jpg`;

      const updatedProfile = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
        emergencyName: data.emergencyName || "",
        emergencyPhone: data.emergencyPhone || "",
        joinedDate: joinDate,
        profilePic: avatar,
        role: data.role || "ADMIN",
        sessions: data.sessions || [],
        activity: data.activity || [],
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);

      localStorage.setItem("adminName", data.name || "");
      localStorage.setItem("adminEmail", data.email || "");
      localStorage.setItem("adminAvatar", avatar);
      window.dispatchEvent(new Event("storage"));

    } catch (err) {
      console.error("Fetch profile error:", err);
      showToast("Session expired. Please login again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Name split (safe)
  const nameParts = profile.name ? profile.name.trim().split(/\s+/) : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection + preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    const preview = URL.createObjectURL(selected);
    setPreviewPic(preview);
  };

  // Check if any change happened
  const hasChanges = () => {
    return (
      profile.name.trim() !== originalProfile.name.trim() ||
      profile.phone.trim() !== originalProfile.phone.trim() ||
      profile.dob !== originalProfile.dob ||
      profile.emergencyName.trim() !== originalProfile.emergencyName.trim() ||
      profile.emergencyPhone.trim() !== originalProfile.emergencyPhone.trim() ||
      file !== null
    );
  };

  // Profile completion %
  const getCompletionPercentage = () => {
    const totalFields = 6;
    const filledFields = [
      profile.name.trim() ? 1 : 0,
      profile.phone.trim() ? 1 : 0,
      profile.dob ? 1 : 0,
      profile.emergencyName.trim() ? 1 : 0,
      profile.emergencyPhone.trim() ? 1 : 0,
      profile.profilePic && profile.profilePic !== `${API_BASE}/image/profile.jpg` ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
    return Math.round((filledFields / totalFields) * 100);
  };

  // Save profile
  const handleSave = async () => {
    if (!hasChanges()) {
      showToast("No changes to save", "info");
      setIsEditing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", profile.name.trim());
      formData.append("phone", profile.phone.trim());
      formData.append("dob", profile.dob);
      formData.append("emergencyName", profile.emergencyName.trim());
      formData.append("emergencyPhone", profile.emergencyPhone.trim());
      if (file) formData.append("profilePic", file);

      const res = await authFetch("/api/admin/profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Save error:", errorText);
        throw new Error(`Update failed: ${errorText}`);
      }

      const result = await res.json();
      const data = result.data || result;

      let avatar = data.profilePic;
      if (avatar && !avatar.startsWith("http")) {
        avatar = `${API_BASE}${avatar}`;
      }

      const updatedProfile = {
        ...profile,
        profilePic: avatar,
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : profile.dob,
        phone: data.phone || profile.phone,
        emergencyName: data.emergencyName || profile.emergencyName,
        emergencyPhone: data.emergencyPhone || profile.emergencyPhone,
        activity: data.activity || profile.activity,
      };

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);

      localStorage.setItem("adminName", profile.name);
      localStorage.setItem(
        "adminAvatar",
        avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      );

      window.dispatchEvent(new Event("storage"));

      showToast("Profile updated successfully", "success");
      setIsEditing(false);
      setFile(null);
      setPreviewPic(null);

      // Re-fetch to ensure UI updates with latest data (including new activity & pic)
      await fetchProfile();
    } catch (err) {
      console.error("Save error:", err);
      showToast(`Error updating profile: ${err.message}`, "error");
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
    setFile(null);
    setPreviewPic(null);
  };

  if (loading) return <div className="admin-loading">Loading profile...</div>;

  return (
    <div className="admin-profile-page">
      {/* Toast */}
      {toast.show && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Profile Header */}
      <div className="admin-profile-header slide-down">
        <div className="admin-profile-avatar-wrapper">
          <img
            src={previewPic || profile.profilePic}
            alt="Admin Avatar"
            className="admin-profile-avatar"
            onError={(e) => {
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iI2YxZjhmOSIgc3Ryb2tlPSIjNGNhZjUwIiBzdHJva2Utd2lkdGg9IjQiLz4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDAgMTYgMS43OSA3IDEyIDIgMTQuMjEgNCAxNiA0IDE2QzUuNzkgMTYgNyAxNC4yMSA3IDEyQzcgOS44MSA1Ljc5IDggNCA4QzIuMjEgOCAwIDkuODEgMCAxMiA1LjMzIDE2IDExLjY3IDE2IDEyIDE2WiIgZmlsbD0iIzRjYWY1MCIvPgo8L3N2Zz4K"; // Base64 SVG placeholder
            }}
          />
          {isEditing && (
            <button
              className="admin-avatar-edit-btn"
              onClick={() => document.getElementById("file-input").click()}
            >
              📷
            </button>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="admin-profile-info">
          <h1 className="admin-profile-fullname">
            {firstName} {lastName}
          </h1>
          <p className="admin-profile-role">Role: {profile.role}</p>
          <p className="admin-profile-email">📧 {profile.email}</p>
          <p className="admin-profile-joined">
            Joined {profile.joinedDate}
          </p>
          {/* Profile Completion Below Joined Date */}
          <div className="admin-completion-inline">
            <div className="admin-completion-bar-small">
              <div
                className="admin-completion-progress-small"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <span className="admin-completion-text">{getCompletionPercentage()}% complete</span>
          </div>
        </div>

        <button
          className="admin-edit-btn bounce-hover"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {/* Personal Information Card */}
      <div className={`admin-profile-card ${isEditing ? "slide-up" : ""}`}>
        <h2 className="admin-section-title">Personal Information</h2>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>First Name</label>
            <input
              value={firstName}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  name: `${e.target.value} ${lastName}`,
                }))
              }
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Last Name</label>
            <input
              value={lastName}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  name: `${firstName} ${e.target.value}`,
                }))
              }
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group full-width">
            <label>Email Address</label>
            <input
              value={profile.email}
              disabled
              className="admin-form-input disabled"
            />
          </div>

          <div className="admin-form-group">
            <label>Phone Number</label>
            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, phone: e.target.value }))
              }
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={profile.dob}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, dob: e.target.value }))
              }
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Emergency Contact Name</label>
            <input
              value={profile.emergencyName}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, emergencyName: e.target.value }))
              }
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group full-width">
            <label>Emergency Contact Phone</label>
            <input
              value={profile.emergencyPhone}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, emergencyPhone: e.target.value }))
              }
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>
        </div>

        {isEditing && (
          <div className="admin-button-group">
            <button
              className="admin-save-btn bounce-hover"
              onClick={handleSave}
              disabled={!hasChanges()}
            >
              Save Changes
            </button>

            <button
              className="admin-cancel-btn bounce-hover"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Admin Activity Section */}
      <div className="admin-activity-section">
        <h3>Admin Activity</h3>
        <div className="admin-activity-list">
          {profile.activity.length > 0 ? (
            profile.activity.slice(0, 5).map((action, index) => (
              <div key={index} className="admin-activity-item">
                <span className="admin-activity-action">{action.action}</span>
                <span className="admin-activity-date">
                  {new Date(action.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p>No recent admin activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;