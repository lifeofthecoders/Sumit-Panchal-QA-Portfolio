import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBlogs, deleteBlog } from "../services/blogService";
import AdminBlogHeader from "./AdminBlogHeader";

export default function BlogList() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  // 👉 Hover state added (existing)
  const [isHovering, setIsHovering] = useState(false);

  // 👉 NEW hover states for action buttons
  const [viewHoverId, setViewHoverId] = useState(null);
  const [editHoverId, setEditHoverId] = useState(null);
  const [deleteHoverId, setDeleteHoverId] = useState(null);

  useEffect(() => {
    setBlogs(getBlogs());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      deleteBlog(id);
      setBlogs(getBlogs());
    }
  };

  return (
    <>
      <AdminBlogHeader />

      <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ fontSize: "18.72px", fontWeight: "700" }}>
            Manage Blogs
          </h2>

          {/* ✅ Existing hover button unchanged */}
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
                  {/* ✅ Headers now bold */}
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "700" }}>Image</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "700" }}>Type</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "700" }}>Author</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "700" }}>Profession</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "700" }}>Date</th>
                  <th style={{ padding: "15px", textAlign: "left", fontWeight: "700" }}>Title</th>
                  <th style={{ padding: "15px", textAlign: "center", fontWeight: "700" }}>Actions</th>
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

                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "12px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        {blog.type}
                      </span>
                    </td>

                    <td style={{ padding: "15px", fontWeight: "500" }}>
                      {blog.author}
                    </td>

                    <td style={{ padding: "15px", color: "#666" }}>
                      {blog.profession}
                    </td>

                    <td style={{ padding: "15px", color: "#666", fontSize: "14px" }}>
                      {blog.date}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        fontWeight: "500",
                        maxWidth: "300px",
                      }}
                    >
                      {blog.title.length > 50
                        ? blog.title.substring(0, 50) + "..."
                        : blog.title}
                    </td>

                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        {/* VIEW */}
                        <button
                          onClick={() =>
                            navigate(`/admin/blogs/view/${blog.id}`)
                          }
                          onMouseEnter={() => setViewHoverId(blog.id)}
                          onMouseLeave={() => setViewHoverId(null)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor:
                              viewHoverId === blog.id
                                ? "#1976d2"
                                : "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "13px",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <b>View</b>
                        </button>

                        {/* EDIT */}
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
                          <b>Edit</b>
                        </button>

                        {/* DELETE */}
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
                          <b>Delete</b>
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
    </>
  );
}
