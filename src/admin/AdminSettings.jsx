import React, { useState } from "react";

const AdminSettings = () => {
  const [password, setPassword] = useState("");

  const handleChangePassword = () => {
    if (!password) return alert("Enter new password");

    localStorage.setItem("adminPassword", password);
    alert("Password Updated Successfully");

    // Call backend API for email verification here
  };

  return (
    <div>
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleChangePassword}>Update Password</button>
    </div>
  );
};

export default AdminSettings;