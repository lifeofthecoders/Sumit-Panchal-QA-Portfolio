import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBlogById, saveBlog, uploadBlogImage } from "../services/blogService";
import { compressImage, validateImageFile, formatFileSize } from "../services/imageUtils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AdminBlogHeader from "./AdminBlogHeader";
import usePageAnimations from "../hooks/usePageAnimations";

export default function BlogForm() {
  usePageAnimations();

  // ✅ ANIMATION HOOK - OPTIMIZED FOR SMOOTH SCROLL
  useEffect(() => {
    /* ============================
       ANCHOR ICON COPY LINK
       ============================ */
    const anchorIcons = document.querySelectorAll(".anchor-icon");

    const handleAnchorClick = (e) => {
      e.preventDefault();
      const id = e.currentTarget.getAttribute("data-target");
      if (!id) return;

      const fullURL =
        window.location.origin + window.location.pathname + "#" + id;

      navigator.clipboard.writeText(fullURL);

      e.currentTarget.innerText = "✅";
      setTimeout(() => {
        e.currentTarget.innerText = "🔗";
      }, 1200);
    };

    anchorIcons.forEach((icon) =>
      icon.addEventListener("click", handleAnchorClick)
    );

    /* ============================
       INTERSECTION OBSERVER
       ============================ */
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      ".slide-up, .hero-animate h1, .hero-animate h2, .profile-slide, .animate-content"
    );

    animatedElements.forEach((el) => observer.observe(el));

    /* ============================
       LOGO RE-ANIMATION (SMOOTH)
       ============================ */
    const logo = document.querySelector(".logo-slide");
    let lastScrollY = window.scrollY;
    let animationFrameId = null;
    let pendingScroll = false;

    const restartLogoAnimation = () => {
      if (!logo) return;
      logo.classList.remove("animate");
      void logo.offsetWidth;
      logo.classList.add("animate");
    };

    restartLogoAnimation();

    const handleScrollOptimized = () => {
      pendingScroll = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollY) > 15) {
          restartLogoAnimation();
          lastScrollY = currentScroll;
        }
        pendingScroll = false;
      });
    };

    window.addEventListener("scroll", handleScrollOptimized, { passive: true });

    /* ============================
       CLEANUP (CRITICAL)
       ============================ */
    return () => {
      anchorIcons.forEach((icon) =>
        icon.removeEventListener("click", handleAnchorClick)
      );
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollOptimized);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ Local date (YYYY-MM-DD) - works with input type="date"
  const getTodayLocalYYYYMMDD = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    image: "",
    imageFile: null,
    imagePreview: "",
    type: "",
    author: "",
    profession: "",
    date: getTodayLocalYYYYMMDD(),
    title: "",
    description: "",
  });

  /* ✅ Existing hover states */
  const [publishHover, setPublishHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);

  /* ✅ NEW Back button hover */
  const [backHover, setBackHover] = useState(false);

  // ✅ NEW: Loader state (for instant action)
  const [isPublishing, setIsPublishing] = useState(false);

  // ✅ NEW: Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      if (id) {
        const blog = await getBlogById(id);
        if (blog) {
          // Map Mongo _id to id if needed
          const normalized = { ...blog, id: blog.id || blog._id };

          setFormData({
            ...normalized,
            imageFile: null,
            imagePreview: "",
          });
        }
      }
    };

    loadBlog();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ instant UI feedback
    setIsPublishing(true);

    try {
      const plainText = formData.description.replace(/<[^>]*>/g, "");
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;

      if (wordCount > 10000) {
        alert("Description exceeds 10,000 words limit!");
        setIsPublishing(false);
        return;
      }

      let finalImageUrl = formData.image;

      // ✅ Upload to Cloudinary if file exists
      if (formData.imageFile) {
        setUploadProgress(0);
        setIsUploadingImage(true);
        setUploadError("");
        
        try {
          finalImageUrl = await uploadBlogImage(formData.imageFile, (progress) => {
            setUploadProgress(Math.round(progress));
          });
        } catch (uploadErr) {
          setIsUploadingImage(false);
          setUploadProgress(0);
          throw uploadErr;
        }
        
        setIsUploadingImage(false);
        setUploadProgress(0);
      }

      // Final validation: do not allow saving blob/file/local paths
      const isRemote = finalImageUrl && typeof finalImageUrl === "string" && (finalImageUrl.startsWith("http://") || finalImageUrl.startsWith("https://"));
      if (!isRemote) {
        throw new Error("Please upload the image to the server before saving. Local or blob URLs are not allowed.");
      }

      await saveBlog({
        ...formData,
        image: finalImageUrl,
        id: id || undefined,
      });

      navigate("/admin/blogs");
    } catch (error) {
      console.error(error);
      setIsPublishing(false);
      
      // Provide more detailed error messages
      let errorMsg = error.message || "Something went wrong while publishing the blog.";
      
      if (errorMsg.includes("timeout")) {
        errorMsg = "⏱️ Upload is taking too long. This usually means:\n\n1. Your internet connection is slow\n2. The backend server (Render) is overloaded\n3. The image file is very large\n\nTry:\n- Using a smaller image\n- Waiting a moment and trying again\n- Checking your internet connection";
      } else if (errorMsg.includes("Failed to fetch")) {
        errorMsg = "❌ Cannot connect to the server. Please check:\n\n1. Your internet connection is working\n2. The backend is running (https://sumit-panchal-qa-portfolio.onrender.com/api/health)\n3. If issue persists, wait a minute and try again (Render free tier may need time to wake up)";
      } else if (errorMsg.includes("Cloudinary") || errorMsg.includes("unavailable")) {
        errorMsg += "\n\n⚠️ Image upload service is not available. Please check:\n1. Your backend is running\n2. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in backend/.env\n3. Your internet connection";
      } else if (errorMsg.includes("blob") || errorMsg.includes("Local")) {
        errorMsg += "\n\n💡 Tip: Select an image file from your computer and wait for it to upload to the server before saving.";
      }
      
      alert(errorMsg);
    }
  };

  const plainText = formData.description.replace(/<[^>]*>/g, "");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "blockquote",
    "code-block",
  ];

  return (
    <>
      <AdminBlogHeader />

      <div
        style={{
          minHeight: "calc(100vh - 160px)",
          padding: "40px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* ✅ Back Button */}
        <button
          onClick={() => navigate("/admin/blogs")}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          disabled={isPublishing}
          style={{
            padding: "16px 24px",
            backgroundColor: backHover ? "#21C87A" : "#4CAF50",
            opacity: isPublishing ? 0.7 : 1,
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isPublishing ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            width: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          ← Back to Blog List
        </button>

        <h2 style={{ margin: "20px 20px 20px 0px", fontSize: "18.72px" }}>
          <b>{id ? "✏️📚 Edit Blog" : "➕📚 Add New Blog"}</b>
        </h2>

        <form onSubmit={handleSubmit}>
          {/* ✅ Blog Image Upload */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              <b>Blog Image</b> <span style={{ color: "red" }}>*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // Clear previous error
                setUploadError("");

                // Validate file
                const validation = validateImageFile(file);
                if (!validation.valid) {
                  setUploadError(validation.error);
                  return;
                }

                // Show loading state and compress image
                setIsUploadingImage(true);
                setUploadProgress(0);

                try {
                  const compressedFile = await compressImage(file);
                  const originalSize = formatFileSize(file.size);
                  const compressedSize = formatFileSize(compressedFile.size);
                  const savings = Math.round((1 - compressedFile.size / file.size) * 100);

                  console.log(
                    `✅ Image compressed: ${originalSize} → ${compressedSize} (${savings}% smaller)`
                  );

                  setFormData((prev) => ({
                    ...prev,
                    imageFile: compressedFile,
                    imagePreview: URL.createObjectURL(compressedFile),
                  }));

                  setIsUploadingImage(false);
                  setUploadProgress(0);
                } catch (error) {
                  console.error("Image compression error:", error);
                  setUploadError(`Failed to compress image: ${error.message}`);
                  setIsUploadingImage(false);
                  setUploadProgress(0);
                }
              }}
              disabled={isPublishing || isUploadingImage}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: uploadError ? "2px solid #f44336" : "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: isUploadingImage ? "#f5f5f5" : "white",
                opacity: isUploadingImage ? 0.7 : 1,
              }}
            />

            {/* ✅ Error Message */}
            {uploadError && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px",
                  backgroundColor: "#ffebee",
                  color: "#c62828",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                ⚠️ {uploadError}
              </div>
            )}

            {/* ✅ Compression Progress */}
            {isUploadingImage && (
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <div
                      style={{
                        height: "6px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          backgroundColor: "#4CAF50",
                          width: `${uploadProgress}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", color: "#666", minWidth: "30px" }}>
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
                  🖼️ Compressing image...
                </p>
              </div>
            )}

            {/* Preview */}
            {(formData.imagePreview || formData.image) && (
              <img
                src={formData.imagePreview || formData.image}
                alt="Preview"
                style={{
                  marginTop: "10px",
                  maxWidth: "200px",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>

          {/* Blog Type */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Type</b> <span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              disabled={isPublishing}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Blog Type</option>
              <option value="Testing">Testing</option>
              <option value="Manual Testing">Manual Testing</option>
              <option value="Automation Testing">Automation Testing</option>
              <option value="Software Testing">Software Testing</option>
              <option value="Performance Testing">Performance Testing</option>
              <option value="Selenium">Selenium</option>
              <option value="Innovation">Innovation</option>
              <option value="Frameworks">Frameworks</option>
              <option value="Education">Education</option>
              <option value="AI">AI</option>
              <option value="DevOps">DevOps</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Author */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Author Name</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Author Name"
              required
              disabled={isPublishing}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Profession */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Author's Profession</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Author's Profession"
              required
              disabled={isPublishing}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Date */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b> Publish Date</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isPublishing}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Title</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Blog Title"
              required
              disabled={isPublishing}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Description</b> <span style={{ color: "red" }}>*</span> (Max 10,000 words)
            </label>

            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={modules}
              formats={formats}
              placeholder="Write your blog content here..."
              style={{
                backgroundColor: "white",
                minHeight: "400px",
                marginBottom: "10px",
              }}
            />

            <p
              style={{
                fontSize: "12px",
                color: wordCount > 10000 ? "red" : "#666",
                marginTop: "revert-layer",
              }}
            >
              Word Count: {wordCount} / 10,000
            </p>

            {/* ✅ NEW: Publishing status text with progress */}
            {isPublishing && (
              <div style={{ marginTop: "15px" }}>
                {isUploadingImage ? (
                  <>
                    <p style={{ fontSize: "13px", color: "#1976D2", marginTop: "10px", marginBottom: "8px" }}>
                      📤 Uploading image: {uploadProgress}%
                    </p>
                    <div
                      style={{
                        height: "4px",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          backgroundColor: "#1976D2",
                          width: `${uploadProgress}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: "13px", color: "#333", marginTop: "10px" }}>
                    ⏳ Publishing... Please wait (saving blog)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button
              type="submit"
              onMouseEnter={() => setPublishHover(true)}
              onMouseLeave={() => setPublishHover(false)}
              disabled={isPublishing}
              style={{
                padding: "16px 30px",
                fontSize: "16px",
                backgroundColor: publishHover ? "#21C87A" : "#4CAF50",
                opacity: isPublishing ? 0.7 : 1,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isPublishing ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              {isPublishing
                ? id
                  ? "Updating..."
                  : "Publishing..."
                : id
                ? "Update Blog"
                : "Publish Blog"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/blogs")}
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
              disabled={isPublishing}
              style={{
                padding: "16px 30px",
                fontSize: "16px",
                backgroundColor: cancelHover ? "#ff5c5c" : "#f44336",
                opacity: isPublishing ? 0.7 : 1,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isPublishing ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
