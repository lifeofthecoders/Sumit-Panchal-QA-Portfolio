// src/config/api.js
// Single source of truth for the frontend backend host.
// Update PRODUCTION_API_BASE_URL only if the Render service URL changes.
const PRODUCTION_API_BASE_URL =
  "https://sumit-panchal-qa-portfolio-1h3z.onrender.com";

// API requests use Vite's /api proxy during local development.
// Production requests always use the verified Render backend URL.
const API_BASE_URL = import.meta.env.DEV ? "" : PRODUCTION_API_BASE_URL;

// Static backend assets (such as /image/profile.jpg) need the backend origin
// even during local development because only /api is proxied by Vite.
export const BACKEND_ASSET_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : PRODUCTION_API_BASE_URL;

export default API_BASE_URL;
