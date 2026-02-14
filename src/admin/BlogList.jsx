import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBlogsPaginated, deleteBlog } from "../services/blogService";
import AdminBlogHeader from "./AdminBlogHeader";
import Loader from "../components/Loader";

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Total blogs count (needed for descending srNo)
  const [totalBlogs, setTotalBlogs] = useState(0);

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

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoading(true);

        const result = await getBlogsPaginated(page, limit);

        // ✅ Backend already returns latest first (createdAt: -1)
        setBlogs(Array.isArray(result?.data) ? result.data : []);
        setTotalPages(result?.pagination?.totalPages || 1);

        // ✅ Store total count for descending serial number
        setTotalBlogs(result?.pagination?.totalBlogs || 0);
      } catch (err) {
        console.error("Failed to load blogs:", err);
        setBlogs([]);
        setTotalPages(1);
        setTotalBlogs(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, [page]);

  /* ================= DELETE HANDLERS ================= */

  const handleDeleteClick = (id) => {
    setSelectedBlogId(id);

    // Reset modal hover states
    setCancelHover(false);
    setModalDeleteHover(false);

    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);

      await deleteBlog(selectedBlogId);

      // After delete, reload data
      const result = await getBlogsPaginated(page, limit);

      const newBlogs = Array.isArray(result?.data) ? result.data : [];
      const newTotalPages = result?.pagination?.totalPages || 1;

      // ✅ Update total count again after delete
      const newTotalBlogs = result?.pagination?.totalBlogs || 0;

      // If current page becomes empty after delete, go back 1 page
      if (newBlogs.length === 0 && page > 1) {
        setPage((p) => Math.max(p - 1, 1));
        return;
      }

      setBlogs(newBlogs);
      setTotalPages(newTotalPages);
      setTotalBlogs(newTotalBlogs);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsLoading(false);

      // Reset modal hover states
      setCancelHover(false);
      setModalDeleteHover(false);

      setShowDeleteModal(false);
      setSelectedBlogId(null);
    }
  };

  const cancelDelete = () => {
    // Reset modal hover states
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
        {!isLoading && blogs.length === 0 ? (
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
                  <th style={{ padding: "15px", textAlign: "center" }}>
                    Author
                  </th>
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
                {/* ✅ FIXED: Do NOT reverse. Backend already sends latest first */}
                {blogs.map((blog, index) => {
                  const blogId = blog._id || blog.id;

                  // ✅ Descending srNo (global)
                  const globalIndex = (page - 1) * limit + index;
                  const srNo = totalBlogs - globalIndex;

                  return (
                    <tr key={blogId} style={{ borderBottom: "1px solid #eee" }}>
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
                                deleteHoverId === blogId ? "#B71C1C" : "#f44336",
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

        {/* PAGINATION */}
        {!isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "30px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: page === 1 ? "not-allowed" : "pointer",
                background: page === 1 ? "#ccc" : "#4CAF50",
                color: "#fff",
                fontWeight: "700",
                transition: "all 0.25s ease",
              }}
            >
              ◀ Prev
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(page - 3, 0), Math.min(page + 2, totalPages))
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    background: p === page ? "#21C87A" : "#E8F5E9",
                    color: p === page ? "#fff" : "#2E7D32",
                    fontWeight: "800",
                    minWidth: "44px",
                    transition: "all 0.25s ease",
                  }}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                background: page === totalPages ? "#ccc" : "#4CAF50",
                color: "#fff",
                fontWeight: "700",
                transition: "all 0.25s ease",
              }}
            >
              Next ▶
            </button>
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
