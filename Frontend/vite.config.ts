import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
      },
      hmr: {
        host: 'localhost',
      },
    },
    build: {
      // Minification is enabled by default in production
      minify: 'terser', // Use Terser for highly optimized minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Remove console logs in production
          drop_debugger: true,
        },
        format: {
          comments: false, // Remove all comments
        },
      },
      // Optimize chunks
      rollupOptions: {
        output: {
          // Split code into chunks for better caching
          manualChunks: {
            'vendor': ['react', 'react-dom', 'motion'],
          },
        },
      },
      // Source maps only in development
      sourcemap: mode === 'development',
    },
  };
});
