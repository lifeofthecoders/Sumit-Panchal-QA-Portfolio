import React, { useState, useEffect } from "react";
import "./admin-profile.css";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);

  // Toast state (matching AdminLogin style)
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/profile`, {
          method: "GET",
          credentials: "include",
          mode: "cors",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();

        const joinDate = data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          joinedDate: joinDate,
          profilePic: data.profilePic || `${API_BASE}/image/profile.jpg`, // Default or from backend
        });
      } catch (err) {
        showToast("Session expired. Please login again.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      if (file) formData.append("profilePic", file);

      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        method: "PUT",
        credentials: "include",
        mode: "cors",
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      setProfile({ ...profile, profilePic: data.profilePic || profile.profilePic });
      showToast("Profile updated successfully", "success");
      setIsEditing(false);
      setFile(null);
    } catch (err) {
      showToast("Error updating profile", "error");
    }
  };

  if (loading) return <div className="admin-loading">Loading profile...</div>;

  const [firstName, lastName] = profile.name.split(" ") || ["Admin", "User"];

  return (
    <div className="admin-profile-page fade-in">
      {/* Toast Notification */}
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
            <button className="admin-avatar-edit-btn" onClick={() => document.getElementById("file-input").click()}>
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
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: `${e.target.value} ${lastName}`,
                })
              }
              disabled={!isEditing}
              placeholder="First Name"
              className="admin-form-input"
            />
          </div>

          <div className="admin-form-group">
            <label>Last Name</label>
            <input
              value={lastName}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: `${firstName} ${e.target.value}`,
                })
              }
              disabled={!isEditing}
              placeholder="Last Name"
              className="admin-form-input"
            />
          </div>
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
            placeholder="Enter phone number"
            className="admin-form-input"
          />
        </div>

        {isEditing && (
          <button onClick={handleSave} className="admin-save-btn bounce-hover">
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;