/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
    plugins: [
        viteSingleFile(),
    ],
    define: {
        'process.env': process.env
    },
    build: {
        minify: true,
        manifest: false,
        outDir: 'dist',
        commonjsOptions: {
            transformMixedEsModules: true
        },
        rollupOptions: {
            input: fileURLToPath(new URL('./silent_refresh/silent_refresh.html', import.meta.url))
        }
    },
});
