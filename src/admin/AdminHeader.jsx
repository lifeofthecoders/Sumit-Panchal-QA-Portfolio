import { useEffect, useState } from "react";
import "../assets/css/admin-header.css";

const AdminHeader = () => {
  const [avatar, setAvatar] = useState(
    localStorage.getItem("adminAvatar") || "/image/profile.jpg"
  );

  const [name, setName] = useState(
    (localStorage.getItem("adminName") || "ADMIN").toUpperCase()
  );

  useEffect(() => {
    const updateHeader = () => {
      setAvatar(localStorage.getItem("adminAvatar"));
      setName((localStorage.getItem("adminName") || "ADMIN").toUpperCase());
    };

    window.addEventListener("storage", updateHeader);
    return () => window.removeEventListener("storage", updateHeader);
  }, []);

  return (
    <div className="admin-header">
      <div className="admin-header-right">
        <span className="admin-header-name">{name}</span>
        <img src={avatar} className="admin-header-avatar" alt="Admin avatar" />
      </div>
    </div>
  );
};

export default AdminHeader;