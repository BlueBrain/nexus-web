
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
        mainFields: ['module', 'main'],
        entryPoints: ['./server/index.ts'],
        loader: { ".node": "file" },
        external: [
            "esbuild",
            "lightningcss"
        ],
        // issue on gh: https://github.com/evanw/esbuild/issues/1921#issuecomment-1710527349
        banner: {
            js: "const require = (await import('node:module')).createRequire(import.meta.url);const __filename = (await import('node:url')).fileURLToPath(import.meta.url);const __dirname = (await import('node:path')).dirname(__filename);"
        }
    },
};