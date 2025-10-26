import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // ajuste os plugins conforme seu stack


export default defineConfig({
plugins: [react()],
build: {
outDir: "server/_core/public",
emptyOutDir: true
}
});