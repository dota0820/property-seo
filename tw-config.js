// Shared Tailwind theme for PrimeVerse Ipoh (Pro + Basic).
// Browser: loaded right after the Tailwind CDN script, sets window.tailwind.config.
// Build:   required by tailwind.config.js so the compiled CSS uses the same tokens.
// Every colour points at a CSS variable in styles.css, so the A / B / C theme
// switcher recolours the whole page (no hard-coded hex values in markup).
(function (config) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  } else if (typeof window !== "undefined" && window.tailwind) {
    window.tailwind.config = config;
  }
})({
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted-ink)",
        canvas: "var(--canvas)",
        line: "var(--line)",
        success: "var(--success)",
        warn: "var(--warn)",
        brand: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-primary-hover)",
          soft: "var(--brand-primary-soft)",
          accent: "var(--brand-accent)",
          dark: "var(--brand-dark)"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Noto Sans SC'", "system-ui", "-apple-system", "sans-serif"]
      }
    }
  }
});
