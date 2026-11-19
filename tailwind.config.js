// Production build config (replaces the Tailwind CDN script when you run `npm run build:css`).
module.exports = {
  content: ["./*.html", "./app.js", "./basic.js", "./data.js", "./icons.js"],
  ...require("./tw-config.js")
};
