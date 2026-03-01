import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./admin-layout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Optional: Get admin info from localStorage or context (adjust as per your auth)
  const adminName = localStorage.getItem("adminName") || "Admin"; // fallback
  const adminEmail = localStorage.getItem("adminEmail") || "";

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  const confirmLogout = () => {
    // Clear cookie
    document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Clear any localStorage items related to auth
    localStorage.removeItem("admin-just-logged-in");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    
    closeLogoutModal();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-container">
            <div className="brand-logo">A</div>
            <h2 className="brand-title">Admin Panel</h2>
          </div>
          <button className="close-btn" onClick={closeSidebar}>×</button>
        </div>

        {/* Admin Info (optional) */}
        <div className="admin-info">
          <div className="admin-avatar">SP</div>
          <div className="admin-details">
            <span className="admin-name">{adminName}</span>
            {adminEmail && <span className="admin-email">{adminEmail}</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} 
            end 
            onClick={closeSidebar}
          >
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>

          <NavLink 
            to="/admin/blogs" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} 
            onClick={closeSidebar}
          >
            <span className="nav-icon">📚</span> Blogs
          </NavLink>

          <NavLink 
            to="/admin/blogs/add" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} 
            onClick={closeSidebar}
          >
            <span className="nav-icon">➕</span> Add New Blog
          </NavLink>

          <NavLink 
            to="/admin/profile" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} 
            onClick={closeSidebar}
          >
            <span className="nav-icon">👤</span> Profile
          </NavLink>

          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} 
            onClick={closeSidebar}
          >
            <span className="nav-icon">⚙️</span> Settings
          </NavLink>
        </nav>

        <hr className="sidebar-divider" />

        <button className="logout-btn" onClick={openLogoutModal}>
          <span className="nav-icon">🚪</span> Logout
        </button>
      </aside>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          ☰
        </button>

        <div className="main-content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout from the Admin Panel?</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={closeLogoutModal}>
                Cancel
              </button>
              <button className="modal-btn logout" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;