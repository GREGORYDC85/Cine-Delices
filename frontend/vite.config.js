import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // ✅ Render sert ton site à la racine, donc pas de sous-dossier
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_FRONTEND_PORT) || 5173,
  },
});
