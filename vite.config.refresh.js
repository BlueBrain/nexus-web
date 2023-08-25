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
        manifest: true,
        outDir: 'dist_refresh',
        commonjsOptions: {
            transformMixedEsModules: true
        },
        rollupOptions: {
            input: {
                silent_refresh: fileURLToPath(new URL('./silent_refresh/silent_refresh.html', import.meta.url)),
            },
        }
    },
});
