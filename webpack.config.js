module.exports = {
    entry: './src/app.js'],
    output: {
        path      : __dirname,
        filename  : './dist/bundle.js'
    },
    module: {
        loader: [{
            test  : /\.css$/,
            loader: 'style!css'
        },{
            test   : /\.jsx?$/,
            loader : 'babel-loader',
            exclude: /node_modules/,
            query  : {
                presets: ['es2015', 'react'],
                plugins: ['transform-runtime']
            }
        }]
    }
}
