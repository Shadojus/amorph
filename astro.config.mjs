import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://funginomi.com',
  
  // SSR mit Node.js Adapter
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  
  integrations: [
    sitemap()
  ],
  
  // Build output directory
  outDir: './dist',
  
  // Public assets directory  
  publicDir: './public',
  
  // Source directory
  srcDir: './src',
  
  // Vite config for existing JS modules
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@morphs': '/morphs',
        '@features': '/features',
        '@core': '/core',
        '@config': '/config',
        '@util': '/util',
        '@styles': '/styles',
        '@data': '/data'
      }
    },
    // Serve existing directories as static assets
    server: {
      fs: {
        allow: ['..']
      }
    }
  },
  
  // Markdown/MDX support for future content
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
