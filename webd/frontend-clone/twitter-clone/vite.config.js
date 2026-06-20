/**
 * Vite Configuration for X (Twitter) Clone
 * ------------------------------------------
 * Uses the official @tailwindcss/vite plugin (Tailwind CSS v4).
 * No separate tailwind.config.js or PostCSS config needed —
 * Tailwind v4 uses a CSS-first approach with the Vite plugin.
 */
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(), // Tailwind CSS v4 Vite plugin — handles scanning & compilation
  ],
});
