

# PWA + TWA Setup Plan

This plan covers two parts: (1) making the app a Progressive Web App installable from the browser, and (2) preparing it for wrapping with a Trusted Web Activity to list on the Google Play Store.

## Part 1: PWA Setup

### Step 1 — Install vite-plugin-pwa
Add `vite-plugin-pwa` as a dev dependency.

### Step 2 — Create PWA icons
Generate required icon sizes (192x192 and 512x512) in `public/` for the manifest. Use an app-appropriate icon (e.g., based on the existing branding).

### Step 3 — Configure vite-plugin-pwa in vite.config.ts
- Register with `registerType: "autoUpdate"`
- Set `devOptions: { enabled: false }` (PWA only in production)
- Add `navigateFallbackDenylist: [/^\/~oauth/]`
- Define manifest with app name "Miftahou Tarbiya", theme color, icons, `display: "standalone"`, `start_url: "/"`

### Step 4 — Update index.html
- Set proper `<title>` and meta tags (theme-color, apple-mobile-web-app-capable, apple-touch-icon)
- Add `<link rel="manifest" href="/manifest.webmanifest">`

### Step 5 — Add service worker guard in main.tsx
Prevent SW registration in iframes and Lovable preview hosts to avoid caching issues during development.

### Step 6 — Update meta tags
Set proper app name, description, and OG tags to "Miftahou Tarbiya".

## Part 2: TWA Preparation

TWA wrapping happens **outside** the Lovable codebase — it's a separate Android project. Here's what's needed:

### Step 7 — Create an assetlinks.json file
Add `public/.well-known/assetlinks.json` — this is the Digital Asset Links file that proves you own the website. It links your domain to your Android app's signing certificate.

### Step 8 — Provide TWA setup instructions
The user will need to:
1. **Publish the app** to get a live URL (e.g., via Lovable's publish or a custom domain)
2. Use **Bubblewrap CLI** (Google's tool) to generate a TWA Android project from the published URL
3. Sign the APK/AAB with a keystore
4. Upload the SHA-256 fingerprint into `assetlinks.json`
5. Submit to Google Play Console ($25 one-time fee)

## Important Notes
- PWA features (install prompt, offline) only work on the **published** version, not in the Lovable editor preview
- The app must be published to a stable URL before creating the TWA wrapper
- TWA requires the published site to pass Chrome's PWA installability checks (valid manifest, service worker, HTTPS)

## Files to create/edit
| File | Action |
|------|--------|
| `package.json` | Add `vite-plugin-pwa` |
| `vite.config.ts` | Configure PWA plugin |
| `index.html` | Update meta tags, title |
| `src/main.tsx` | Add SW guard for preview |
| `public/pwa-192x192.png` | Create icon |
| `public/pwa-512x512.png` | Create icon |
| `public/.well-known/assetlinks.json` | Placeholder for TWA |

