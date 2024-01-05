/// <reference types="vitest" />
/** @type {import('vite').UserConfig} */
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

import { dynamicBase } from 'vite-plugin-dynamic-base';
import { execSync } from "child_process";
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import commonjs from 'vite-plugin-commonjs';
import viteCompression from 'vite-plugin-compression';
import 'vite-compatible-readable-stream';

export default defineConfig(() => {
    let commitHash = '', version = '';

    if(process.env.VITEST !== 'true') {
        try {
            commitHash = execSync('git rev-parse HEAD').toString().trimEnd();
            version = execSync('git describe --tags --always').toString().trimEnd();
        } catch (error) {
            console.log('⛔️ describe may not getting the latest tag')
        }
    }

    return ({
        base: process.env.NODE_ENV === 'production' ? "/__BASE__/" : "/",
        plugins: [
            react(),
            tsconfigPaths(),
            svgrPlugin(),
            commonjs(),
            viteCompression(),
            dynamicBase({
                publicPath: 'window.__BASE__',
                transformIndexHtml: true,
            })
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
            'process.env': process.env,
            FUSION_VERSION: process.env.NODE_ENV === 'test' ? JSON.stringify('1.0.0') : JSON.stringify(version),
            COMMIT_HASH: JSON.stringify(commitHash),
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ["./vitest-setup.js"],
            testTimeout: 60000,
            reporters: process.env.REPORT === 'true',
            sequence: {
                shuffle: true,
            },
        },
        build: {
            minify: true,
            cssMinify: true,
            manifest: true,
            emptyOutDir: false,
            outDir: 'dist',
            assetsDir: 'public',
            sourcemap: process.env.NODE_ENV !== 'production',
            commonjsOptions: {
                transformMixedEsModules: true
            },
            rollupOptions: {
                input: fileURLToPath(new URL('./index.html', import.meta.url)),
                output: {
                    manualChunks: {
                        lodash: ['lodash'],
                        pdfjs: ['node_modules/pdfjs-dist/build/pdf.worker.min.js'],
                        codemirror: ["codemirror", "react-codemirror2"]
                    }
                }
            }
        },
        assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.mp4', '**/*.png', '**/*.svg']
    })
});
