import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        banner: `

const __filename = fileURLToPath(import.meta.url);
        `,
      },
    },
  },
  // define: {
  //   __filename: `fileURLToPath(import.meta.url)`,
  // }
});
