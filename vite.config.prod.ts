import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh in development
      fastRefresh: process.env.NODE_ENV !== 'production',
    }),
    // Bundle analyzer - generates stats.html
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'terser',
    
    // Terser options for aggressive minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
        passes: 2, // Run compression twice for better results
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    
    // Rollup options for advanced code splitting
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Advanced manual chunking strategy
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // tRPC and query related
            if (id.includes('@trpc') || id.includes('@tanstack/react-query')) {
              return 'trpc-vendor';
            }
            // UI and styling
            if (id.includes('framer-motion') || id.includes('tailwind') || id.includes('clsx')) {
              return 'ui-vendor';
            }
            // Charts and visualization
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }
            // AI and ML libraries
            if (id.includes('@google/genai') || id.includes('openai')) {
              return 'ai-vendor';
            }
            // Utilities
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('zod')) {
              return 'utils-vendor';
            }
            // Everything else goes to vendor
            return 'vendor';
          }
          
          // Application chunks
          if (id.includes('/modules/')) {
            const moduleName = id.split('/modules/')[1].split('/')[0];
            return `module-${moduleName}`;
          }
          
          if (id.includes('/components/')) {
            return 'components';
          }
          
          if (id.includes('/services/')) {
            return 'services';
          }
          
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        entryFileNames: `assets/js/[name]-[hash].js`,
      },
      
      // External dependencies (if using CDN)
      external: [],
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn for chunks larger than 500kb
    
    // Asset inlining threshold
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Enable CSS minification
    cssMinify: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@trpc/client',
      '@trpc/react-query',
      '@tanstack/react-query',
      'recharts',
      'zod',
    ],
    exclude: ['@google/genai'], // Exclude large AI libraries from pre-bundling
  },
  
  // Server configuration for production preview
  preview: {
    port: 5176,
    host: true,
    strictPort: true,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './components'),
      '@modules': resolve(__dirname, './modules'),
      '@services': resolve(__dirname, './services'),
      '@hooks': resolve(__dirname, './hooks'),
      '@lib': resolve(__dirname, './lib'),
      '@types': resolve(__dirname, './types'),
    },
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEV__: false,
    __PROD__: true,
  },
  
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      }
      return { relative: true };
    },
  },
});