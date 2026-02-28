import React, { useState, useEffect } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://sumit-panchal-qa-portfolio.onrender.com";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/profile`, {
          method: "GET",
          credentials: "include", // ✅ VERY IMPORTANT
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError("Session expired. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ VERY IMPORTANT
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Profile updated successfully");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Admin Profile</h2>

      <input
        name="name"
        value={profile.name}
        onChange={handleChange}
        placeholder="Name"
      />

      <input
        name="email"
        value={profile.email}
        disabled
      />

      <input
        name="phone"
        value={profile.phone}
        onChange={handleChange}
        placeholder="Phone"
      />

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default AdminProfile;