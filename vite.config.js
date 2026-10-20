import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base: "/Sumit-Panchal-QA-Portfolio/",
  plugins: [react()],

  server:
    command === "serve"
      ? {
          proxy: {
            "/api": {
              target: "http://localhost:5000",
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
}));