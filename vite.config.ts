import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        id: "/",
        name: "Faydabook — Bibliothèque Tidjaniyya",
        short_name: "Faydabook",
        description:
          "Bibliothèque numérique des enseignements de la Tariqa Tijaniyya : œuvres de Cheikh Ibrahim Niasse et de la Faydah, en français, anglais et arabe.",
        theme_color: "#1a5c2e",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "fr",
        dir: "ltr",
        categories: ["books", "education", "lifestyle"],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        handle_links: "preferred",
        edge_side_panel: {
          preferred_width: 480,
        },
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/desktop-1.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
            label: "Faydabook library on desktop",
          },
          {
            src: "/screenshots/mobile-1.png",
            sizes: "704x1280",
            type: "image/png",
            form_factor: "narrow",
            label: "Faydabook library on mobile",
          },
        ],
        shortcuts: [
          {
            name: "Bibliothèque",
            short_name: "Library",
            description: "Parcourir tous les livres",
            url: "/library",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Audio",
            short_name: "Audio",
            description: "Écouter les livres audio",
            url: "/audio",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Réglages",
            short_name: "Settings",
            description: "Préférences",
            url: "/settings",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
