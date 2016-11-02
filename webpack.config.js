module.exports = {
    cache: true,
    devtool: 'source-map',
    entry: ['./client/src/index.jsx'],
    output: {
        path: './client/static/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: ['react', 'es2015']
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            }
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        // 'react': 'React'
    },
    resolve: {
        unsafeCache: true,
        extensions: ['', '.js', '.jsx', '.css', '.scss']
    }
}
