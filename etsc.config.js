
module.exports = {
    // Supports all esbuild.build options
    tsConfigFile: './tsconfig.node.json',
    esbuild: {
        minify: false,
        target: "es2020",
        outdir: './dist/server',
        bundle: true,
        loader: { ".node": "file" },
        external: [
            "esbuild",
            "lightningcss"
        ]
    },
};