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
    const commitHash = execSync('git rev-parse HEAD').toString().trimEnd();
    const version = execSync('git describe --tags').toString().trimEnd();

    return ({
        base: "/__BASE__/",
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
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                'shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
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
            FUSION_VERSION: process.env.NODE_ENV === 'test' ? JSON.stringify('1.0.0') : JSON.stringify(version),
            COMMIT_HASH: JSON.stringify(commitHash),
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ["./vitest-setup.js"],
            minThreads: 2,
            maxThreads: 4,
            // reporters: 'html',
            sequence: {
                shuffle: true,
                // seed: 1695803934123,
            }
        },
        build: {
            minify: false,
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
                        pdfjs: ['node_modules/pdfjs-dist/build/pdf.js'],
                        codemirror: ["codemirror", "react-codemirror2"]
                    }
                }
            },
        },
        assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.mp4', '**/*.png', '**/*.svg']
    })
});
