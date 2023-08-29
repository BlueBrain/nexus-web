/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import commonjs from 'vite-plugin-commonjs';
import 'vite-compatible-readable-stream';
import { execSync } from "child_process"

export default defineConfig(() => {

    const commitHash = execSync('git rev-parse HEAD').toString().trimEnd();
    const version = execSync('git describe --tags').toString().trimEnd();
    console.log('@@git revision', {
        commitHash,
        version
    })
    return ({
        plugins: [
            react(),
            tsconfigPaths(),
            svgrPlugin(),
            commonjs(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                'pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
                'components': fileURLToPath(new URL('./src/shared/components', import.meta.url)),
                'molecules': fileURLToPath(new URL('./src/shared/molecules', import.meta.url)),
                'modals': fileURLToPath(new URL('./src/shared/modals', import.meta.url)),
                'hooks': fileURLToPath(new URL('./src/shared/hooks', import.meta.url)),
                'server': fileURLToPath(new URL('./server', import.meta.url)),
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
            'process.env': process.env,
            FUSION_VERSION: JSON.stringify(version),
            COMMIT_HASH: JSON.stringify(commitHash),
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: "./setupFile.js",
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
    })
});
