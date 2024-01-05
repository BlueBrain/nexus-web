module.exports = {
    tsConfigFile: './tsconfig.node.json',
    esbuild: {
        minify: true,
        bundle: true,
        sourcemap: true,
        platform: 'node',
        format: 'esm',
        target: "esnext",
        outdir: 'dist',
        entryPoints: ['./server/index.ts'],
        loader: { ".node": "file" },
        external: [
            "fsevents",
            "lightningcss",
        ],
        // gh: https://github.com/evanw/esbuild/issues/1921
        banner: {
            js: `
                import path from 'path';
                import { fileURLToPath } from 'url';
                import { createRequire as topLevelCreateRequire } from 'module';
                const require = topLevelCreateRequire(import.meta.url);
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
            `
        },
        outExtension: {
            '.js': '.mjs'
        }
    },
};