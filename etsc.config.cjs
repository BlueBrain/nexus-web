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
                import { createRequire as topLevelCreateRequire } from 'module';
                const require = topLevelCreateRequire(import.meta.url);
                const __dirname = new URL('.', import.meta.url).pathname;
            `
        },
        outExtension: {
            '.js': '.mjs'
        }
    },
};
