import {defineConfig} from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        electron({
            main: {
                // Shortcut of `build.lib.entry`.
                entry: 'electron/main.ts',
                onstart({reload}) {
                    // 开发模式下自动重载
                    reload();
                },
                vite: {
                    build: {
                        outDir: 'dist-electron', // 确保输出目录与此处一致
                        rollupOptions: {
                            output: {
                                format: 'cjs', // 输出为 CommonJS
                                // entryFileNames: 'preload.js', // 确保文件名正确
                            },
                        },
                    },
                },
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`.
                // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
                input: path.join(__dirname, 'electron/preload.ts'),
                vite: {
                    build: {
                        outDir: 'dist-electron',
                        rollupOptions: {
                            output: {
                                format: 'cjs', // 确保输出为 CommonJS 以解决之前的 ESM 错误
                                entryFileNames: 'preload.cjs', // 确保输出文件名为 preload.js
                            },
                        },
                    },
                },
            },
            // Ployfill the Electron and Node.js API for Renderer process.
            // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
            // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
            renderer: process.env.NODE_ENV === 'test'
                // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
                ? undefined
                : {},
        }),
    ],
// 代理
    server: {
        proxy: {
            '/api': {
                target: 'http://192.168.1.169:9980/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
})
