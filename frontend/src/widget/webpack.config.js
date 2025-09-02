const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      widget: './src/widget.js',
      'payment-links': './src/payment-links.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].min.js' : '[name].js',
      // Each entry point gets its own namespace
      library: {
        name: '[name]PayWidget', 
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/widget.html',
        filename: 'index.html',
        chunks: ['widget'] // Only include widget.js in the HTML
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'widget.min.css'
        })
      ] : [])
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 9001
    }
  };
};