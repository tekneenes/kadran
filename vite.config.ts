import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/kadran/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/news/trt-egitim': {
          target: 'https://www.trthaber.com',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/trt-egitim/, '/egitim_articles.rss'),
        },
        '/api/news/trt': {
          target: 'https://www.trthaber.com',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/trt/, '/sondakika.rss'),
        },
        '/api/news/ntv': {
          target: 'https://www.ntv.com.tr',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/xml, text/xml, */*'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/ntv/, '/gundem.rss'),
        },
        '/api/news/aa': {
          target: 'https://www.aa.com.tr',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/aa/, '/tr/rss/default?cat=guncel'),
        },
        '/api/news/webtekno': {
          target: 'https://www.webtekno.com',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/webtekno/, '/rss.xml'),
        },
        '/api/news/shiftdelete': {
          target: 'https://shiftdelete.net',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/shiftdelete/, '/feed'),
        },
        '/api/news/haberturk': {
          target: 'https://www.haberturk.com',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/haberturk/, '/rss'),
        },
        '/api/news/cnnturk': {
          target: 'https://www.cnnturk.com',
          changeOrigin: true,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          rewrite: (path) => path.replace(/^\/api\/news\/cnnturk/, '/feed/rss/all/news'),
        },
      },
    },
  };
});
