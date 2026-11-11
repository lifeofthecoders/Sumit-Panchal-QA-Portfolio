
import API_BASE_URL from "../config/api";

const getAdminLoginUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  // Preserve the configured deployment base path.
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;

  return `${normalizedBaseUrl}#/admin/login`;
};

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("admin-token");

  // Do not send an empty or missing Bearer token.
  if (!token) {
    window.location.replace(getAdminLoginUrl());

    throw new Error("Authentication required. Please log in.");
  }

  const headers = new Headers(options.headers || {});

  headers.set("Authorization", `Bearer ${token}`);

  // Preserve FormData headers; the browser sets its multipart boundary.
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Clear invalid, expired, or revoked authentication tokens.
  if (response.status === 401) {
    localStorage.removeItem("admin-token");

    // Avoid repeatedly redirecting if already on the login page.
    if (window.location.hash !== "#/admin/login") {
      window.location.replace(getAdminLoginUrl());
    }
  }

  return response;
};
