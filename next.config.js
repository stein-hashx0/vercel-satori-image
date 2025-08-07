// next.config.js
const path = require('path');

module.exports = {
  experimental: {
    /**
     * Include every font file in public/fonts/** inside the
     * lambda that backs /api/generate-image
     */
    outputFileTracingIncludes: {
      '/api/generate-image': ['./public/fonts/**/*'],
    },
    // If your repo root isn’t the Next.js root, uncomment ↓
    // outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};
