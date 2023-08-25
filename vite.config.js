/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import commonjs from 'vite-plugin-commonjs';
import 'vite-compatible-readable-stream';


export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        svgrPlugin(),
        commonjs(),
    ],
    resolve: {
        alias: {
            process: 'process/browser',
            buffer: 'buffer',
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            path: 'path-browserify',
            assert: 'assert',
            http: 'stream-http',
            https: 'https-browserify',
            os: 'os-browserify',
            url: 'url',
            util: 'util'
        }
    },
    define: {
        'process.env': process.env
    },
    build: {
        manifest: true,
        commonjsOptions: {
            transformMixedEsModules: true
        },
        rollupOptions: {
            input: fileURLToPath(new URL('./index.html', import.meta.url)),
            output: {
                manualChunks: {
                    lodash: ['lodash'],
                    pdfjs: ['node_modules/pdfjs-dist/build/pdf.js'],
                    codemirror: ["codemirror", "react-codemirror2"]
                }
            }
        }
    },
    // optimizeDeps: {
    //     exclude: ["@bbp/nexus-sdk", "@bbp/nexus-link"]
    // },
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.mp4']
});
