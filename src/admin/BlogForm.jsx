import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getBlogById, saveBlog, uploadBlogImage } from "../services/blogService";
import { compressImage, validateImageFile, formatFileSize } from "../services/imageUtils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AdminBlogHeader from "./AdminBlogHeader";
import usePageAnimations from "../hooks/usePageAnimations";

export default function BlogForm() {
  usePageAnimations();

  // Keep track of preview URL so we can revoke it (prevents memory leak)
  const previewUrlRef = useRef(null);

  // ✅ NEW: cache last uploaded file signature so we don't re-upload unnecessarily
  const lastUploadedSignatureRef = useRef(null);

  // ✅ NEW: cache last uploaded URL
  const lastUploadedUrlRef = useRef("");

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

      const fullURL = window.location.origin + window.location.pathname + "#" + id;

      navigator.clipboard.writeText(fullURL);

      e.currentTarget.innerText = "✅";
      setTimeout(() => {
        e.currentTarget.innerText = "🔗";
      }, 1200);
    };

    anchorIcons.forEach((icon) => icon.addEventListener("click", handleAnchorClick));

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

    const restartLogoAnimation = () => {
      if (!logo) return;
      logo.classList.remove("animate");
      void logo.offsetWidth;
      logo.classList.add("animate");
    };

    restartLogoAnimation();

    const handleScrollOptimized = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - lastScrollY) > 15) {
          restartLogoAnimation();
          lastScrollY = currentScroll;
        }
      });
    };

    window.addEventListener("scroll", handleScrollOptimized, { passive: true });

    /* ============================
       CLEANUP (CRITICAL)
       ============================ */
    return () => {
      anchorIcons.forEach((icon) => icon.removeEventListener("click", handleAnchorClick));
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollOptimized);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
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

  // ✅ Loader state
  const [isPublishing, setIsPublishing] = useState(false);

  // ✅ Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      if (id) {
        const blog = await getBlogById(id);
        if (blog) {
          const normalized = { ...blog, id: blog.id || blog._id };

          // If blog already has image, cache it
          if (normalized.image) {
            lastUploadedUrlRef.current = normalized.image;
          }

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

  // ✅ helper: generate a stable signature for file
  const getFileSignature = (file) => {
    if (!file) return "";
    return `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submit
    if (isPublishing) return;

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

      // ✅ If user selected a new file, upload it
      if (formData.imageFile) {
        const currentSignature = getFileSignature(formData.imageFile);

        // ✅ If already uploaded this exact file, reuse URL (FAST)
        if (
          lastUploadedSignatureRef.current === currentSignature &&
          lastUploadedUrlRef.current
        ) {
          finalImageUrl = lastUploadedUrlRef.current;
        } else {
          setUploadProgress(0);
          setIsUploadingImage(true);
          setUploadError("");

          try {
            finalImageUrl = await uploadBlogImage(formData.imageFile, (progress) => {
              setUploadProgress(Math.round(progress));
            });

            // Cache upload result
            lastUploadedSignatureRef.current = currentSignature;
            lastUploadedUrlRef.current = finalImageUrl;
          } catch (uploadErr) {
            setIsUploadingImage(false);
            setUploadProgress(0);
            throw uploadErr;
          }

          setIsUploadingImage(false);
          setUploadProgress(0);
        }
      }

      // Final validation: do not allow saving blob/file/local paths
      const isRemote =
        finalImageUrl &&
        typeof finalImageUrl === "string" &&
        (finalImageUrl.startsWith("http://") || finalImageUrl.startsWith("https://"));

      if (!isRemote) {
        throw new Error(
          "Please upload the image to the server before saving. Local or blob URLs are not allowed."
        );
      }

      await saveBlog({
        ...formData,
        image: finalImageUrl,
        id: id || undefined,
      });

      navigate("/admin/blogs");
    } catch (error) {
      console.error("Publish error:", error);
      setIsPublishing(false);

      let errorMsg = error.message || "Something went wrong while publishing the blog.";

      if (errorMsg.includes("Cannot reach")) {
        errorMsg =
          "❌ Cannot connect to backend server.\n\nPlease:\n1. Refresh the page\n2. Wait 1-2 minutes (server may be starting up)\n3. Try again";
      } else if (errorMsg.includes("File too large")) {
        errorMsg =
          "📦 File too large!\n\nMaximum size is 50MB.\n\nPlease:\n- Compress your image\n- Or use a smaller image";
      } else if (
        errorMsg.includes("Server upload timeout") ||
        errorMsg.includes("Cloudinary is taking too long")
      ) {
        errorMsg =
          "⏱️ Upload is taking too long.\n\nTry:\n- Using a smaller/compressed image\n- Try again after some time";
      } else if (errorMsg.includes("timeout")) {
        errorMsg =
          "⏱️ Upload is taking too long.\n\nTry:\n- Using a smaller/compressed image\n- Checking your internet speed";
      } else if (errorMsg.includes("Failed to fetch")) {
        errorMsg =
          "❌ Cannot reach the server.\n\nPlease check your internet connection or backend status.";
      } else if (errorMsg.includes("404")) {
        errorMsg =
          "❌ Upload endpoint not found on server.\n\nBackend may be misconfigured.";
      } else if (errorMsg.includes("Cloudinary")) {
        errorMsg =
          "⚠️ Cloudinary image service error.\n\nPlease verify CLOUDINARY credentials.";
      }

      alert(errorMsg);
    } finally {
      setIsPublishing(false);
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
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Blog Image</b> <span style={{ color: "red" }}>*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              disabled={isPublishing || isUploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setUploadError("");

                // Validate file type + warning size
                const validation = validateImageFile(file);

                if (!validation.valid) {
                  setUploadError(validation.error);
                  return;
                }

                // Show compressing UI
                setIsUploadingImage(true);
                setUploadProgress(0);

                try {
                  // Compress
                  const compressedFile = await compressImage(file);

                  const originalSize = formatFileSize(file.size);
                  const compressedSize = formatFileSize(compressedFile.size);
                  const savings = Math.round((1 - compressedFile.size / file.size) * 100);

                  console.log(
                    `✅ Image compressed: ${originalSize} → ${compressedSize} (${savings}% smaller)`
                  );

                  // Revoke old preview URL
                  if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                    previewUrlRef.current = null;
                  }

                  const previewUrl = URL.createObjectURL(compressedFile);
                  previewUrlRef.current = previewUrl;

                  // Reset upload cache because file changed
                  lastUploadedSignatureRef.current = null;
                  lastUploadedUrlRef.current = "";

                  setFormData((prev) => ({
                    ...prev,
                    imageFile: compressedFile,
                    imagePreview: previewUrl,
                  }));

                  // Stop loader (upload happens on Publish, same as before)
                  setIsUploadingImage(false);
                  setUploadProgress(0);
                } catch (error) {
                  console.error("Image compression error:", error);
                  setUploadError(`Failed to compress image: ${error.message}`);
                  setIsUploadingImage(false);
                  setUploadProgress(0);
                }
              }}
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

            {/* ✅ Upload Progress (only visible during publish upload) */}
            {isPublishing && formData.imageFile && (
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
                  🖼️ Uploading image...
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
              <b>Profession</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
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

          {/* Date */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Date</b> <span style={{ color: "red" }}>*</span>
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
              <b>Title</b> <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
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

          {/* Description */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
              <b>Description</b> <span style={{ color: "red" }}>*</span>
            </label>

            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={modules}
              formats={formats}
              readOnly={isPublishing}
              style={{
                height: "250px",
                marginBottom: "50px",
                backgroundColor: "white",
              }}
            />

            <p style={{ fontSize: "13px", color: wordCount > 10000 ? "red" : "#555" }}>
              Word Count: {wordCount} / 10,000
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button
              type="submit"
              onMouseEnter={() => setPublishHover(true)}
              onMouseLeave={() => setPublishHover(false)}
              disabled={isPublishing || isUploadingImage}
              style={{
                padding: "14px 26px",
                backgroundColor: publishHover ? "#21C87A" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isPublishing ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "600",
                opacity: isPublishing ? 0.7 : 1,
              }}
            >
              {isPublishing ? "Publishing..." : id ? "Update Blog" : "Publish Blog"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/blogs")}
              onMouseEnter={() => setCancelHover(true)}
              onMouseLeave={() => setCancelHover(false)}
              disabled={isPublishing}
              style={{
                padding: "14px 26px",
                backgroundColor: cancelHover ? "#f44336" : "#e53935",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isPublishing ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: "600",
                opacity: isPublishing ? 0.7 : 1,
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
