import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Configuration pour GitHub Pages
export default defineConfig({
  base: "/Cine-Delices/", // <-- important pour GitHub Pages
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_FRONTEND_PORT) || 5173,
  },
});
