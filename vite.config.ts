import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: "public",
  server: {
    host: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        blog: "blog.html",
        // welcome: resolve(__dirname, "public/pages/welcome.html"),
      },
    },
  },
});
