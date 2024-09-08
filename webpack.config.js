const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const copyPlugin = require('copy-webpack-plugin');

module.exports = env => {
    /*
        [EXAMPLE]
        • Here's how to export an MPA instead of a SPA.
        • You'll probably still need to tweak a lot of stuff to make wildcard routes (id routes) work as expected.
    */
    // const routes = ['index', 'toc'];
    // const multipleHtmlPlugins = routes.map(filename => {
    //     return new htmlWebpackPlugin({
    //         template: './src/index.html',
    //         filename: `${filename}.html`,
    //         chunks: 'app'
    //     });
    // });

    return {
        mode: 'development',
        entry: {
            app: path.resolve(__dirname, 'src/js/index.jsx')
        },
        snapshot: {
            managedPaths: []
        },
        watchOptions: {
            followSymlinks: true
        },
        resolve: {
            symlinks: false,
            extensions: ['.js', '.jsx']
        },
        output: {
            /*
                [REQUIRED]
                • For routes other than root.
            */
            publicPath: '/',
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].bundle.js',
            assetModuleFilename: 'images/[name][ext]',
            clean: true
        },
        target: 'web',
        devServer: {
            static: path.resolve(__dirname, 'src'),
            port: 80,
            open: false,
            hot: true,
            compress: true,
            /*
                [REQUIRED]
                • For routes other than root.

                [WARNING]
                • This feature only works in development.
                • For production, view the "-s" flag for the "serve" command in package.json or use an equivalent option for your production server to fallback to index.html for expected SPA behavior / structure.
                • For the VSCode "Live Server" extension, add the following for an equivalent fallback option:
                    • "liveServer.settings.file": "index.html"
                • These flags / settings / options should already be setup or at least depicted in examples already inside of "package.json" or ".vscode/settings.json", so be sure to take a look at those files for usage examples.
            */
            historyApiFallback: true
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: [
                        /node_modules\/(?!@ocdla\/global-components)/,
                        /dev_modules\/(?!@ocdla\/global-components)/
                    ],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ]
                        }
                    }
                },
                {
                    test: /\.html$/i,
                    exclude: [
                        /node_modules\/(?!@ocdla\/global-components)/,
                        /dev_modules\/(?!@ocdla\/global-components)/
                    ],
                    use: ['html-loader']
                },
                {
                    test: /\.css$/i,
                    exclude: [
                        /node_modules\/(?!@ocdla\/global-components)/,
                        /dev_modules\/(?!@ocdla\/global-components)/
                    ],
                    use: ['style-loader', 'css-loader', 'postcss-loader']
                },
                {
                    test: /\.(svg|eot|ttf|woff|woff2)$/i,
                    exclude: [
                        /node_modules\/(?!@ocdla\/global-components)/,
                        /dev_modules\/(?!@ocdla\/global-components)/
                    ],
                    type: 'asset/resource'
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    exclude: [
                        /node_modules\/(?!@ocdla\/global-components)/,
                        /dev_modules\/(?!@ocdla\/global-components)/
                    ],
                    type: 'asset/resource'
                },
                {
                    test: /\.xml$/i,
                    exclude: [
                        /node_modules\/(?!@ocdla\/global-components)/,
                        /dev_modules\/(?!@ocdla\/global-components)/
                    ],
                    type: 'asset/source'
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                USE_MOCK: JSON.stringify(env.USE_MOCK || false),
                USE_LOCAL_STATUTES_XML: JSON.stringify(
                    env.USE_LOCAL_STATUTES_XML || true
                ),
                APP_NAME: JSON.stringify(env.APP_NAME),
                BASE_PATH: JSON.stringify(env.BASE_PATH || false)
            }),
            new htmlWebpackPlugin({
                template: path.resolve(__dirname, 'src/index.html'),
                chunks: 'app',
                inject: 'body',
                filename: 'index.html',
                templateParameters: {
                    title: 'HTML Webpack Plugin'
                }
            }),
            // ...multipleHtmlPlugins,
            new copyPlugin({
                patterns: [
                    // {
                    //     from: path.resolve(__dirname, 'src/images'),
                    //     to: path.resolve(__dirname, 'dist/images')
                    // }
                    'src/.nojekyll',
                    'src/404.html'
                ]
            })
        ]
    };
};
