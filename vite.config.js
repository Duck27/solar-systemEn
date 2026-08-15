import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    proxy: {
      "/api/nasa": {
        target: "https://ssd.jpl.nasa.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nasa/, "/api"),
      },
    },
  },
});
