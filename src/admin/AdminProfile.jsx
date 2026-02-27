import React, { useState, useEffect } from "react";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "sumitpanchal2552@gmail.com",
    phone: "",
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("adminProfile"));
    if (saved) setProfile(saved);
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem("adminProfile", JSON.stringify(profile));
    alert("Profile Updated");
  };

  const handleDelete = () => {
    localStorage.removeItem("adminProfile");
    alert("Profile Deleted");
  };

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
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="phone"
        value={profile.phone}
        onChange={handleChange}
        placeholder="Phone"
      />

      <button onClick={handleSave}>Save</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default AdminProfile;