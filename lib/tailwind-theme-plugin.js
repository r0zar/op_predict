// Tailwind plugin for theme variants
const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addVariant }) {
  // Add cyberpunk and protoss variants
  addVariant('cyberpunk', '[data-theme="cyberpunk"] &');
  addVariant('protoss', '[data-theme="protoss"] &');
});