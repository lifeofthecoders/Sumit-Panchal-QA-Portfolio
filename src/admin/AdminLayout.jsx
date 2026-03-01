import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./admin-layout.css";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ← New state

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  const confirmLogout = () => {
    // Clear cookie
    document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    closeLogoutModal();
    navigate("/admin-login", { replace: true });
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

        <nav className="sidebar-nav">
          <NavLink to="/admin" className="nav-link" end onClick={closeSidebar}>
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>
          <NavLink to="/admin/blogs" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">📚</span> Blogs
          </NavLink>
          <NavLink to="/admin/blogs/add" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">➕</span> Add New Blog
          </NavLink>
          <NavLink to="/admin/profile" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">👤</span> Profile
          </NavLink>
          <NavLink to="/admin/settings" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">⚙️</span> Settings
          </NavLink>
        </nav>

        <hr className="sidebar-divider" />

        <button className="logout-btn" onClick={openLogoutModal}>
          🚪 Sign Out
        </button>
      </aside>

      {/* Mobile backdrop */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      {/* Main Content */}
      <main className="admin-main">
        <button className="hamburger-btn" onClick={toggleSidebar}>☰</button>
        <div className="main-content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* ==================== CUSTOM LOGOUT MODAL ==================== */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to Sign Out of the Admin Panel?</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={closeLogoutModal}>
                Cancel
              </button>
              <button className="modal-btn logout" onClick={confirmLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;