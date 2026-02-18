// Determine API base URL. Prefer build-time VITE_API_BASE_URL, fallback to runtime detection
// so the GitHub Pages build can still call the deployed backend without rebaking env vars.
const RENDER_BACKEND = "https://sumit-panchal-qa-portfolio.onrender.com";
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

try {
  // If running from GitHub Pages (frontend deployed at lifeofthecoders.github.io),
  // prefer the Render backend URL so uploads don't attempt to contact localhost.
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host.includes("github.io") || host.includes("githubusercontent.com")) {
      API_BASE_URL = RENDER_BACKEND;
    }
  }
} catch (e) {
  // ignore in non-browser environments
}

console.log("🔧 Blog API configured to:", API_BASE_URL);

/**
 * Check if backend is accessible
 */
const checkBackendHealth = async (timeout = 10000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
};

/**
 * GET all blogs (latest first)
 */
export const getBlogs = async () => {
  const res = await fetch(`${API_BASE_URL}/api/blogs`);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return await res.json();
};

/**
 * GET single blog
 */
export const getBlogById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
  if (!res.ok) return null;
  return await res.json();
};

/**
 * Create or Update blog
 */
export const saveBlog = async (blog) => {
  // Update
  if (blog.id) {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });

    if (!res.ok) throw new Error("Failed to update blog");
    return await res.json();
  }

  // Create
  const payload = { ...blog };
  delete payload.id;

  const res = await fetch(`${API_BASE_URL}/api/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create blog");
  return await res.json();
};

/**
 * Delete blog
 */
export const deleteBlog = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete blog");
  return true;
};

export const getBlogsPaginated = async (page = 1, limit = 10) => {
  const res = await fetch(
    `${API_BASE_URL}/api/blogs?page=${page}&limit=${limit}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return await res.json();
};

/**
 * ✅ Upload Blog Image (Computer Upload → Cloudinary)
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 */
export const uploadBlogImage = async (file, onProgress) => {
  const uploadUrl = `${API_BASE_URL}/api/blogs/upload`;
  const formData = new FormData();
  formData.append("image", file);

  // Pre-flight: Wake up Render backend if cold
  if (API_BASE_URL.includes("onrender.com")) {
    console.log("🔄 Waking up Render backend...");
    if (onProgress) onProgress(5);
    
    const isHealthy = await checkBackendHealth(60000); // 60 sec to wake up
    
    if (!isHealthy) {
      console.warn("⚠️ Backend did not respond to health check. Proceeding anyway...");
    }
  }
  
  // Use XMLHttpRequest for progress tracking
  if (onProgress && typeof onProgress === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let uploadStartTime = Date.now();
      let timeoutOccurred = false;
      
      const timeout = setTimeout(() => {
        timeoutOccurred = true;
        xhr.abort();
      }, 300000); // 5 minute timeout (matches server timeout)

      // Track upload progress (0-90% during upload)
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.min((e.loaded / e.total) * 90, 90);
          onProgress(Math.max(5, percentComplete)); // Don't go below 5%
        }
      });

      xhr.addEventListener("load", () => {
        clearTimeout(timeout);
        const uploadTime = ((Date.now() - uploadStartTime) / 1000).toFixed(1);
        console.log(`✅ Upload response received in ${uploadTime}s (status: ${xhr.status})`);
        
        onProgress(95);

        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const data = JSON.parse(xhr.responseText);
            const url = data.imageUrl || data.url;
            if (!url || typeof url !== "string" || !(url.startsWith("http://") || url.startsWith("https://"))) {
              reject(new Error("Upload succeeded but returned an invalid image URL"));
              return;
            }
            onProgress(100);
            console.log("✅ Upload complete:", url);
            resolve(url);
          } catch (err) {
            reject(new Error("Upload response is invalid: " + err.message));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(`❌ Upload failed (${xhr.status}): ${data.message || xhr.statusText}\n\nEndpoint: ${uploadUrl}`));
          } catch {
            reject(new Error(`❌ Upload failed with status ${xhr.status}\n\nEndpoint: ${uploadUrl}\n\nThis usually means:\n- Backend is not responding\n- Endpoint doesn't exist\n- CORS is blocking the request`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        clearTimeout(timeout);
        reject(new Error(`❌ Network error: Cannot reach ${uploadUrl}\n\nMake sure:\n1. Backend is running (check: https://sumit-panchal-qa-portfolio.onrender.com/api/health)\n2. Internet connection is stable\n3. Firewall isn't blocking Cloudinary`));
      });

      xhr.addEventListener("abort", () => {
        clearTimeout(timeout);
        if (timeoutOccurred) {
          reject(new Error(`❌ Upload timeout at endpoint: ${uploadUrl}\n\nThe server took longer than 5 minutes. This usually means:\n1. Backend is starting/loading (cold start)\n2. Cloudinary service is experiencing issues\n3. Network connection is unstable\n\nPlease try:\n- Refreshing the page and waiting 1 minute\n- Using a smaller image file\n- Checking your internet connection\n- Trying again later`));
        } else {
          reject(new Error("Upload was cancelled"));
        }
      });

      console.log("📤 Uploading to:", uploadUrl);
      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    });
  }

  // Fallback to fetch for simple upload without progress
  try {
    console.log("📤 Uploading (no progress tracking) to:", uploadUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(
        `Upload API returned invalid response (not JSON)\n\nEndpoint: ${uploadUrl}\n\nThis usually means:\n- Backend is not running\n- VITE_API_BASE_URL is wrong\n- Endpoint doesn't exist`
      );
    }

    if (!res.ok) {
      throw new Error(`❌ ${data.message || "Image upload failed"}\n\nEndpoint: ${uploadUrl}\nStatus: ${res.status}`);
    }

    const url = data.imageUrl || data.url;
    if (!url || (typeof url !== "string") || !(url.startsWith("http://") || url.startsWith("https://"))) {
      throw new Error("Upload succeeded but returned an invalid image URL");
    }

    console.log("✅ Upload complete:", url);
    return url;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`❌ Upload timeout (5 minutes exceeded)\n\nEndpoint: ${uploadUrl}\n\nThe server did not respond in time. Possible reasons:\n1. Backend is starting/loading (cold start)\n2. Cloudinary service is experiencing issues\n3. Network connection is unstable\n\nPlease try:\n- Refreshing the page\n- Using a smaller image file\n- Checking your internet connection`);
    }
    throw err;
  }
};

// Helper to validate image value before saving blog
export const ensureImageIsRemote = (image) => {
  if (!image) return true;
  if (typeof image !== "string") return false;
  const v = image.trim();
  return v.startsWith("http://") || v.startsWith("https://");
};
