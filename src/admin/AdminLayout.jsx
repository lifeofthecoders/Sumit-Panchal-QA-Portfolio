
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "../assets/css/admin-layout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const [adminData, setAdminData] = useState({
    name: localStorage.getItem("adminName") || "Admin",
    email: localStorage.getItem("adminEmail") || "",
    avatar: localStorage.getItem("adminAvatar") || DEFAULT_AVATAR,
  });

  /* =========================
     SYNC ADMIN INFORMATION
  ========================= */
  useEffect(() => {
    const syncAdminData = () => {
      setAdminData({
        name: localStorage.getItem("adminName") || "Admin",
        email: localStorage.getItem("adminEmail") || "",
        avatar:
          localStorage.getItem("adminAvatar") || DEFAULT_AVATAR,
      });
    };

    syncAdminData();

    window.addEventListener("admin-data-updated", syncAdminData);
    window.addEventListener("storage", syncAdminData);

    return () => {
      window.removeEventListener("admin-data-updated", syncAdminData);
      window.removeEventListener("storage", syncAdminData);
    };
  }, []);

  /* =========================
     SIDEBAR CONTROLS
  ========================= */
  const toggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    if (!loggingOut) {
      setShowLogoutModal(false);
    }
  };

  /* =========================
     CLEAR LOCAL ADMIN SESSION
  ========================= */
  const clearLocalAdminSession = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-just-logged-in");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminAvatar");

    window.dispatchEvent(new Event("admin-data-updated"));
  };

  /* =========================
     SECURE ADMIN LOGOUT
  ========================= */
  const confirmLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    const token = localStorage.getItem("admin-token");

    try {
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok && response.status !== 401) {
          console.error(
            "Backend logout could not be confirmed:",
            response.status
          );
        }
      }
    } catch (error) {
      console.error("Backend logout request failed:", error);
    } finally {
      // Always clear this browser's local session.
      clearLocalAdminSession();

      setShowLogoutModal(false);
      setLoggingOut(false);

      // Replace history entry so Back does not restore the admin page.
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-container">
            <img
              className="brand-logo"
              src={`${import.meta.env.BASE_URL}image/logo.svg`}
              alt="Sumit Panchal Logo"
            />

            <h2 className="brand-title">Admin Panel</h2>
          </div>

          <button
            className="close-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Admin Info */}
        {/* <div className="admin-info">
          <div className="admin-avatar">SP</div>
          <div className="admin-details">
            <span className="admin-name">{adminData.name}</span>
            {adminData.email && (
              <span className="admin-email">{adminData.email}</span>
            )}
          </div>
        </div> */}

        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            end
            onClick={closeSidebar}
          >
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>

          <NavLink
            to="/admin/blogs"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span className="nav-icon">📚</span> Blogs
          </NavLink>

          <NavLink
            to="/admin/blogs/add"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span className="nav-icon">✚ 📚</span>
            Add New Blog
          </NavLink>

          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span className="nav-icon">👤</span> Profile
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <span className="nav-icon">⚙️</span> Settings
          </NavLink>
        </nav>

        <hr className="sidebar-divider" />

        <button
          className="logout-btn"
          onClick={openLogoutModal}
          disabled={loggingOut}
        >
          <span className="nav-icon">↪</span> Logout
        </button>
      </aside>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Admin Header */}
        <div className="admin-header-bar">
          <div className="admin-header-right">
            <span className="admin-header-name">
              {adminData.name}
            </span>

            <img
              src={adminData.avatar}
              alt="Admin Avatar"
              className="admin-header-avatar"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </div>
        </div>

        <div className="main-content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <h3 id="logout-title">Confirm Logout</h3>

            <p>
              Are you sure you want to{" "}
              <span className="modal-logout-word">
                ❝ Logout ❞
              </span>{" "}
              from the Admin Panel?
            </p>

            <div className="modal-buttons">
              <button
                className="modal-btn cancel"
                onClick={closeLogoutModal}
                disabled={loggingOut}
              >
                Cancel
              </button>

              <button
                className="modal-btn logout"
                onClick={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
