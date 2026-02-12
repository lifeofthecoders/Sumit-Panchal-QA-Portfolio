import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBlogs, deleteBlog } from "../services/blogService";
import AdminBlogHeader from "./AdminBlogHeader";
import Loader from "../components/Loader";

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Existing hover states */
  const [isHovering, setIsHovering] = useState(false);
  const [viewHoverId, setViewHoverId] = useState(null);
  const [editHoverId, setEditHoverId] = useState(null);
  const [deleteHoverId, setDeleteHoverId] = useState(null);

  /* Modal hover states */
  const [cancelHover, setCancelHover] = useState(false);
  const [modalDeleteHover, setModalDeleteHover] = useState(false);

  /* Modal State */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  // ✅ FIX: load blogs properly (async)
  const loadBlogs = async () => {
    try {
      const data = await getBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load blogs:", error);
      setBlogs([]);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  /* ================= DELETE HANDLERS ================= */

  const handleDeleteClick = (id) => {
    setSelectedBlogId(id);

    /* ✅ FIX — RESET HOVER STATES */
    setCancelHover(false);
    setModalDeleteHover(false);

    setShowDeleteModal(true);
  };

  // ✅ FIX: confirmDelete must await deleteBlog + reload
  const confirmDelete = async () => {
    try {
      await deleteBlog(selectedBlogId);
      await loadBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }

    /* ✅ FIX — RESET HOVER STATES */
    setCancelHover(false);
    setModalDeleteHover(false);

    setShowDeleteModal(false);
    setSelectedBlogId(null);
  };

  const cancelDelete = () => {
    /* ✅ FIX — RESET HOVER STATES */
    setCancelHover(false);
    setModalDeleteHover(false);

    setShowDeleteModal(false);
    setSelectedBlogId(null);
  };

  return (
    <>
      <AdminBlogHeader />

      {isLoading && <Loader text="Loading blogs..." />}

      <div
        style={{
          minHeight: "calc(100vh - 160px)",
          padding: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
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
            📚 Manage Blogs
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
            ➕ 📚 Add New Blog
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
                  <th style={{ padding: "15px", textAlign: "center" }}>No</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Image</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Author</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>
                    Profession
                  </th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>Title</th>
                  <th style={{ padding: "15px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {blogs.map((blog, index) => {
                  const srNo = blogs.length - index;

                  // ✅ FIX: Support both MongoDB (_id) and old (id)
                  const blogId = blog._id || blog.id;

                  return (
                    <tr
                      key={blogId}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td
                        style={{
                          padding: "15px",
                          fontWeight: "600",
                          textAlign: "center",
                        }}
                      >
                        {srNo}
                      </td>

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

                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {blog.type}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {blog.author}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {blog.profession}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {blog.date}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {blog.title}
                      </td>

                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              navigate(`/admin/blogs/view/${blogId}`)
                            }
                            onMouseEnter={() => setViewHoverId(blogId)}
                            onMouseLeave={() => setViewHoverId(null)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor:
                                viewHoverId === blogId ? "#1565C0" : "#2196F3",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/admin/blogs/edit/${blogId}`)
                            }
                            onMouseEnter={() => setEditHoverId(blogId)}
                            onMouseLeave={() => setEditHoverId(null)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor:
                                editHoverId === blogId ? "#E65100" : "#FF9800",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteClick(blogId)}
                            onMouseEnter={() => setDeleteHoverId(blogId)}
                            onMouseLeave={() => setDeleteHoverId(null)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor:
                                deleteHoverId === blogId
                                  ? "#B71C1C"
                                  : "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ margin: "10px 10px 10px 0px", color: "#f44336" }}>
              🗑️ Delete Blog
            </h3>

            <p style={{ marginBottom: "8px" }}>
              Are you sure you want to delete this blog?
            </p>

            <p
              style={{
                fontSize: "13px",
                color: "#f44336",
                marginBottom: "25px",
                fontWeight: "500",
              }}
            >
              ⚠️ This action is permanent and cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={cancelDelete}
                onMouseEnter={() => setCancelHover(true)}
                onMouseLeave={() => setCancelHover(false)}
                style={{
                  ...cancelBtn,
                  backgroundColor: cancelHover ? "#21C87A" : "#ccc",
                  color: cancelHover ? "#fff" : "#000",
                }}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                onMouseEnter={() => setModalDeleteHover(true)}
                onMouseLeave={() => setModalDeleteHover(false)}
                style={{
                  ...deleteBtn,
                  backgroundColor: modalDeleteHover ? "#B71C1C" : "#f44336",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===== STYLES ===== */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "14px",
  width: "420px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
};

const cancelBtn = {
  padding: "12px 22px",
  background: "#ccc",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

const deleteBtn = {
  padding: "12px 22px",
  background: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};
