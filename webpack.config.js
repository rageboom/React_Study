var path = require("path");
module.exports = {
    //entry: './src/animated_shopping/AnimatedShoppingList.js',
    entry: './src/drag_and_drop/App.js',
        //Contacts: './src/ContactsAppContainer.js'
    output: {
        path      : path.join(__dirname, 'js'),
        filename  : './dist/bundle.js'
    },
    module: {
        loaders: [{
            test   : /\.jsx?$/,
            loader : 'babel-loader',
            exclude: /node_modules/,
            query  : {
                presets: ['es2015', 'react']
            }
        }]
    }
}
