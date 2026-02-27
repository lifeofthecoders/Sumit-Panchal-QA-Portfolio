import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Extra safety: redirect if not logged in
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin-login");
  };

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "12px 16px",
    marginBottom: "8px",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: 500,
    background: isActive ? "#b08bf8" : "transparent",
    color: isActive ? "#fff" : "#333",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa" }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#ffffff",
          padding: "20px",
          boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Admin Panel</h2>

        <nav>
          <NavLink to="/admin/blogs" style={linkStyle}>
            📚 Blogs
          </NavLink>

          <NavLink to="/admin/blogs/add" style={linkStyle}>
            ➕ Add Blog
          </NavLink>

          <NavLink to="/admin/profile" style={linkStyle}>
            👤 Profile
          </NavLink>

          <NavLink to="/admin/settings" style={linkStyle}>
            ⚙ Settings
          </NavLink>
        </nav>

        <hr style={{ margin: "20px 0" }} />

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            background: "#e74c3c",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;