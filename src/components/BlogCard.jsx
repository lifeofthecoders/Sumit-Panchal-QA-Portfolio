import { useNavigate } from "react-router-dom";

export default function BlogCard({ blog }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const blogId = blog?._id || blog?.id;

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s",
        backgroundColor: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      }}
      onClick={() => {
        if (!blogId) return;
        navigate(`/blogs/${blogId}`);
      }}
    >
      {/* Blog Image + Author Info Overlay */}
      <div style={{ position: "relative", height: "280px" }}>
        <img
          src={blog.image || "/image/default-blog.jpg"}
          alt={blog.title}
          onError={(e) => {
            e.currentTarget.src = "/image/default-blog.jpg";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Author Info Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            background:
              "linear-gradient(135deg, rgba(100,100,255,0.9), rgba(150,100,255,0.9))",
            color: "white",
            padding: "12px 20px",
            borderTopLeftRadius: "12px",
            maxWidth: "60%",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "2px",
            }}
          >
            {blog.author}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.9 }}>
            {blog.profession}
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div
        style={{
          padding: "24px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Date + Type Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#666" }}>
            {formatDate(blog.date)}
          </span>
          <span
            style={{
              padding: "6px 14px",
              backgroundColor: "#f0f0f0",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            {blog.type}
          </span>
        </div>

        {/* Blog Title */}
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "12px",
            lineHeight: "1.4",
            color: "#1a1a1a",
          }}
        >
          {blog.title}
        </h3>

        {/* Blog Description Preview */}
        <p
          style={{
            fontSize: "14px",
            textAlign: "justify",
            color: "#666",
            lineHeight: "1.6",
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          {blog.description
            ?.replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim()}
        </p>

        {/* Read More Link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#6366f1",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Read more
          <span style={{ marginLeft: "6px", fontSize: "16px" }}>→</span>
        </div>
      </div>
    </div>
  );
}
