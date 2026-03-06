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

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  /* ================= FETCH PROFILE ================= */

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

        let avatar = data.profilePic;

        if (avatar && !avatar.startsWith("http")) {
          avatar = `${API_BASE}/${avatar}`;
        }

        if (!avatar) avatar = `${API_BASE}/image/profile.jpg`;

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          joinedDate: joinDate,
          profilePic: avatar,
        });

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

  /* ================= NAME SPLIT SAFE ================= */

  const nameParts = profile.name ? profile.name.split(" ") : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  /* ================= INPUT HANDLING ================= */

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    const preview = URL.createObjectURL(selected);

    setProfile({
      ...profile,
      profilePic: preview,
    });
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("admin-token");

      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);

      if (file) formData.append("profilePic", file);

      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      const result = await res.json();
      const data = result.data || result;

      let avatar = data.profilePic;

      if (avatar && !avatar.startsWith("http")) {
        avatar = `${API_BASE}/${avatar}`;
      }

      setProfile({
        ...profile,
        profilePic: avatar,
      });

      localStorage.setItem("adminAvatar", avatar);
      localStorage.setItem("adminName", profile.name);

      showToast("Profile updated successfully", "success");

      setIsEditing(false);
      setFile(null);

    } catch (err) {
      showToast("Error updating profile", "error");
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  if (loading) return <div className="admin-loading">Loading profile...</div>;

  return (
    <div className="admin-profile-page fade-in">

      {toast.show && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-profile-header">

        <div className="admin-profile-avatar-wrapper">
          <img
            src={profile.profilePic}
            alt="Admin Avatar"
            className="admin-profile-avatar"
          />

          {isEditing && (
            <button
              className="admin-avatar-edit-btn"
              onClick={() =>
                document.getElementById("file-input").click()
              }
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

          <p className="admin-profile-email">📧 {profile.email}</p>
          <p className="admin-profile-joined">
            Joined {profile.joinedDate}
          </p>
        </div>

        <button
          className="admin-edit-btn bounce-hover"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="admin-profile-card slide-up">

        <h2 className="admin-section-title">Account Settings</h2>

        <div className="admin-form-grid">

          <div className="admin-form-group">
            <label>First Name</label>
            <input
              value={firstName}
              disabled={!isEditing}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: `${e.target.value} ${lastName}`,
                })
              }
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Last Name</label>
            <input
              value={lastName}
              disabled={!isEditing}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: `${firstName} ${e.target.value}`,
                })
              }
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
              disabled={!isEditing}
              onChange={handleChange}
              className="admin-form-input"
            />
          </div>

        </div>

        {isEditing && (
          <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
            <button
              className="admin-save-btn bounce-hover"
              onClick={handleSave}
            >
              Save Changes
            </button>

            <button
              className="admin-edit-btn"
              style={{ background: "#64748b" }}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminProfile;