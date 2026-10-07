import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy API + uploaded photos to the Express server
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:5000", "/uploads": "http://localhost:5000" } },
});
