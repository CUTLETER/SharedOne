var path = require('path');
const webpack = require('webpack');


module.exports = {
    context: path.resolve(__dirname, 'src/main/react'),
    entry: {


        login: './login/Login.js', // 로그인
        user: './user/User.js', // 직원
        product: './product/Product.js' // 직원
        confirm: './confirm/Confirm.js', // 결재
    },
    devtool: 'sourcemaps',
    cache: true,
    output: { //파일이 생성되는 경로
        path: __dirname,
        filename: './src/main/resources/static/bundle/[name].bundle.js'
    },
    mode: 'none',
    module: {
        rules: [ {
            test: /\.js?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [ '@babel/preset-env', '@babel/preset-react' ]
                }
            }
        }, {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        } ]
    },

    plugins: [
        // fix "process is not defined" error:
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};