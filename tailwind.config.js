/** Tailwind config for Paragon (local build, no CDN)
 * Place at project root (next to index.html) or at your local build folder.
 */
module.exports = {
  content: [
    "./index.html",
    "./servicios/**/*.html",
    "./partials/**/*.html",
    "./**/*.html",
    "./assets/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        "paragon-blue": "#37497B",
        "paragon-dark-blue": "#37497B",
        "paragon-light-blue": "#5063A1"
      }
    }
  },
  plugins: []
};
