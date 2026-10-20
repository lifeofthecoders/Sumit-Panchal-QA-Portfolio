import API_BASE_URL from "../config/api";

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("admin-token");

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Only set JSON header if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Auto logout on unauthorized
  if (response.status === 401) {
    localStorage.removeItem("admin-token");
    window.location.href = "/#/admin/login";
  }

  return response;
};