
module.exports = {
    // Supports all esbuild.build options
    tsConfigFile: './tsconfig.node.json',
    esbuild: {
        minify: true,
        bundle: true,
        sourcemap: true,
        target: "es2020",
        outdir: 'dist',
        entryPoints: ['./server/index.ts'],
        loader: { ".node": "file" },
        external: [
            "esbuild",
            "lightningcss"
        ]
    },
};