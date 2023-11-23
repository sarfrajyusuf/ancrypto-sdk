const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "../dist/umd"),
        filename: "index.js",
        library: "ancryptoSdkPackage",
        libraryTarget: "umd",
        globalObject: "this",
    },
    module: {
        rules: [
            {
                test: /\.ts(x*)?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        configFile: "config/tsconfig.umd.json",
                    },
                },
            },
        ],
    },
    resolve: {
        fallback: {
            // "process": require.resolve("process"),
            // "buffer": require.resolve("buffer"),
            // stream: require.resolve("stream"),
            // crypto: require.resolve("crypto-browserify"),
            // "url": require.resolve("url"),
            // Disable the built-in 'crypto' module to use the polyfill
            // Other modules can be polyfilled in a similar manner
        },
        extensions: [".ts", ".js", ".tsx", ".jsx"],
    },

};