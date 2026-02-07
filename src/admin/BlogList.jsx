import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBlogs, deleteBlog } from "../services/blogService";
import AdminBlogHeader from "./AdminBlogHeader";


export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  /* Existing hover states */
  const [isHovering, setIsHovering] = useState(false);
  const [viewHoverId, setViewHoverId] = useState(null);
  const [editHoverId, setEditHoverId] = useState(null);
  const [deleteHoverId, setDeleteHoverId] = useState(null);

  /* ✅ NEW — Modal State */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  useEffect(() => {
    setBlogs(getBlogs());
  }, []);

  /* ================= DELETE HANDLERS ================= */

  // Open Modal
  const handleDeleteClick = (id) => {
    setSelectedBlogId(id);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const confirmDelete = () => {
    deleteBlog(selectedBlogId);
    setBlogs(getBlogs());
    setShowDeleteModal(false);
    setSelectedBlogId(null);
  };

  // Cancel Delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedBlogId(null);
  };

  return (
    <>
      <AdminBlogHeader />

      <div style={{ padding: "40px 40px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ fontSize: "18.72px", fontWeight: "700" }}>
            📝 Manage Blogs
          </h2>

          <button
            onClick={() => navigate("/admin/blogs/add")}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
              padding: "12px 24px",
              backgroundColor: isHovering ? "#21C87A" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
          >
            + Add New Blog
          </button>
        </div>

        {/* EMPTY STATE */}
        {blogs.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "18px",
              color: "#999",
              marginTop: "60px",
            }}
          >
            No blogs yet. Click "Add New Blog" to create one.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  <th style={{ padding: "15px" }}>Image</th>
                  <th style={{ padding: "15px" }}>Type</th>
                  <th style={{ padding: "15px" }}>Author</th>
                  <th style={{ padding: "15px" }}>Profession</th>
                  <th style={{ padding: "15px" }}>Date</th>
                  <th style={{ padding: "15px" }}>Title</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} style={{ borderBottom: "1px solid #eee" }}>

                    <td style={{ padding: "15px" }}>
                      <img
                        src={blog.image}
                        alt={blog.title}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    </td>

                    <td style={{ padding: "15px" }}>{blog.type}</td>
                    <td style={{ padding: "15px" }}>{blog.author}</td>
                    <td style={{ padding: "15px" }}>{blog.profession}</td>
                    <td style={{ padding: "15px" }}>{blog.date}</td>
                    <td style={{ padding: "15px" }}>{blog.title}</td>

                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>

                        {/* ✅ VIEW BUTTON */}
                        <button
                          onClick={() => navigate(`/admin/blogs/view/${blog.id}`)}
                          onMouseEnter={() => setViewHoverId(blog.id)}
                          onMouseLeave={() => setViewHoverId(null)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor:
                              viewHoverId === blog.id ? "#1565C0" : "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                          }}
                        >
                          View
                        </button>

                        {/* ✅ EDIT BUTTON */}
                        <button
                          onClick={() => navigate(`/admin/blogs/edit/${blog.id}`)}
                          onMouseEnter={() => setEditHoverId(blog.id)}
                          onMouseLeave={() => setEditHoverId(null)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor:
                              editHoverId === blog.id ? "#E65100" : "#FF9800",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                          }}
                        >
                          Edit
                        </button>

                        {/* ✅ DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(blog.id)}
                          onMouseEnter={() => setDeleteHoverId(blog.id)}
                          onMouseLeave={() => setDeleteHoverId(null)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor:
                              deleteHoverId === blog.id ? "#B71C1C" : "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                          }}
                        >
                          Delete
                        </button>


                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Delete Blog</h3>
            <p>Are you sure you want to delete this blog?</p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={cancelDelete} style={cancelBtn}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={deleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= MODAL STYLES ================= */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const cancelBtn = {
  padding: "10px 18px",
  background: "#ccc",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const deleteBtn = {
  padding: "10px 18px",
  background: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
