#!/usr/bin/env node

require('esbuild').build({
  logLevel: "info",
  entryPoints: ['client/app.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'public/app.js',
  define: {
    global: 'window'
  },
  platform: "browser"
}).catch(() => process.exit(1))
