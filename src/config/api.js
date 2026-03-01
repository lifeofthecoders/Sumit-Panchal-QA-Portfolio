// src/config/api.js
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.DEV) {
  API_BASE_URL = '';   // ← forces relative /api/... so Vite proxy works
}

if (!API_BASE_URL && !import.meta.env.DEV) {
  throw new Error(
    "VITE_API_BASE_URL is not defined. Please check your .env file."
  );
}

export default API_BASE_URL;