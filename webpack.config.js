const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'vue-lite.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    devServer:{
        static:{
            directory: path.join(__dirname, 'src/examples'),
        },
        compress: true,
        port: 9000
    }
}