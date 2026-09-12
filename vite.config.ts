import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    // Tauri 需要固定端口并清理屏幕，避免与 Rust 侧 devUrl 不一致
    clearScreen: false,
    plugins: [
        vue(),
    ],
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://192.168.1.169:9980/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/xxl-job-admin': {
                target: 'http://192.168.1.18:38080/',
                changeOrigin: true,
            },
        },
    },
})
