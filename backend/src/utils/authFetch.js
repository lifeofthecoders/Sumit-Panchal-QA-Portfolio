import API_BASE_URL from "../config/api";

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("admin-token");

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("admin-token");
    window.location.href = "/#/admin/login";
  }

  return response;
};