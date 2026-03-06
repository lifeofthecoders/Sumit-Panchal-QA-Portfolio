import React, { useState, useEffect } from "react";
import "./admin-profile.css";
import { authFetch } from "../utils/authFetch";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://sumit-panchal-qa-portfolio.onrender.com";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    joinedDate: "",
    profilePic: "",
  });

  const [originalProfile, setOriginalProfile] = useState({}); // To detect changes
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
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch(`/api/admin/profile`, { method: "GET" });

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

        let avatar = data.profilePic || `${API_BASE}/image/profile.jpg`;
        if (avatar && !avatar.startsWith("http")) {
          avatar = `${API_BASE}/${avatar}`;
        }

        const newProfile = {
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          joinedDate,
          profilePic: avatar,
        };

        setProfile(newProfile);
        setOriginalProfile(newProfile); // Store original for change detection
        setPreviewPic(avatar);

        localStorage.setItem("adminName", data.name || "");
        localStorage.setItem("adminEmail", data.email || "");
        localStorage.setItem("adminAvatar", avatar);
      } catch (err) {
        showToast("Session expired. Please login again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Name split (safe)
  const nameParts = profile.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "firstName") {
      setProfile({ ...profile, name: `${value} ${lastName}`.trim() });
    } else if (name === "lastName") {
      setProfile({ ...profile, name: `${firstName} ${value}`.trim() });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  // Handle file input + preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    const preview = URL.createObjectURL(selected);
    setPreviewPic(preview);
  };

  // Check if any field changed
  const hasChanges = () => {
    return (
      profile.name !== originalProfile.name ||
      profile.phone !== originalProfile.phone ||
      file !== null
    );
  };

  // Save profile
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profile.name.trim());
      formData.append("phone", profile.phone.trim());
      if (file) formData.append("profilePic", file);

      const res = await authFetch(`/api/admin/profile`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      const result = await res.json();
      const data = result.data || result;

      let avatar = data.profilePic || profile.profilePic;
      if (avatar && !avatar.startsWith("http")) {
        avatar = `${API_BASE}/${avatar}`;
      }

      setProfile({ ...profile, profilePic: avatar });
      setOriginalProfile({ ...profile, profilePic: avatar });
      setPreviewPic(avatar);
      setFile(null);

      localStorage.setItem("adminName", profile.name);
      localStorage.setItem("adminAvatar", avatar);

      showToast("Profile updated successfully", "success");
      setIsEditing(false);
    } catch (err) {
      showToast("Error updating profile", "error");
    }
  };

  // Cancel → revert changes
  const handleCancel = () => {
    setProfile(originalProfile);
    setPreviewPic(originalProfile.profilePic);
    setFile(null);
    setIsEditing(false);
    showToast("Changes cancelled", "info");
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

      <div className="admin-profile-header">
        <div className="admin-profile-avatar-wrapper">
          <img
            src={previewPic || profile.profilePic}
            alt="Admin Avatar"
            className="admin-profile-avatar"
          />

          {isEditing && (
            <>
              <button
                className="admin-avatar-edit-btn"
                onClick={() => document.getElementById("file-input").click()}
              >
                📷
              </button>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        <div className="admin-profile-info">
          <h1 className="admin-profile-fullname">
            {firstName} {lastName}
          </h1>
          <p className="admin-profile-email">📧 {profile.email}</p>
          <p className="admin-profile-joined">
            Joined {profile.joinedDate}
          </p>
        </div>

        <button
          className="admin-edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className={`admin-profile-card ${isEditing ? "editing" : ""}`}>
        <h2 className="admin-section-title">Account Settings</h2>

        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label>First Name</label>
            <input
              name="firstName"
              value={firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Last Name</label>
            <input
              name="lastName"
              value={lastName}
              onChange={handleChange}
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

          <div className="admin-form-group full-width">
            <label>Phone Number</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="admin-form-input"
            />
          </div>
        </div>

        {isEditing && (
          <div className="admin-button-group">
            <button
              className="admin-save-btn"
              onClick={handleSave}
              disabled={!hasChanges()}
            >
              Save Changes
            </button>

            <button className="admin-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;