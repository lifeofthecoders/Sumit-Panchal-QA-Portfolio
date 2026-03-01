// src/admin/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to Admin Dashboard</h1>
      <p>Hello, Sumit! Here's a quick overview:</p>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
        <div style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Quick Actions</h3>
          <button onClick={() => window.location.href = '/admin/blogs'}>
            → Manage Blog Posts
          </button>
        </div>

        {/* You can add more cards later: stats, recent posts, etc. */}
      </div>
    </div>
  );
};

export default AdminDashboard;