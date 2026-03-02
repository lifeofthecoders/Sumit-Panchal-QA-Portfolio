// src/admin/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <h1 className="dashboard-title">🚀 Admin Control Center</h1>
        <p className="dashboard-subtitle">
          Welcome back, Sumit! Manage your platform efficiently.
        </p>

        <div className="dashboard-grid">
          <div className="action-card">
            <h3>📊 Blog Management</h3>
            <p>Create, edit, and manage your blog posts easily.</p>

            <button
              className="action-btn"
              onClick={() => navigate("/admin/blogs")}
            >
              📯 Manage Blog Posts
            </button>
          </div>
        </div>
      </div>

      {/* Inline styles for animation & effects */}
      <style>{`
        .dashboard-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #7f5af0, #2cb67d);
          padding: 2rem;
          animation: fadeIn 0.8s ease-in-out;
        }

        .dashboard-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          padding: 3rem;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          transform: translateY(20px);
          animation: slideUp 0.6s ease forwards;
        }

        .dashboard-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .dashboard-grid {
          display: grid;
          gap: 1.5rem;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.15);
          padding: 2rem;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .action-card:hover {
          transform: translateY(-5px) scale(1.02);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }

        .action-btn {
          margin-top: 1rem;
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          background: linear-gradient(135deg, #ff8906, #f25f4c);
          color: white;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .action-btn:active {
          transform: scale(0.95);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;