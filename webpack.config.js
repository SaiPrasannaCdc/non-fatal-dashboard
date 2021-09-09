const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      '@babel/preset-react', // TODO: Enable automatic runtime support
    ]
  },
}

// Development Configuration
module.exports = (env, { mode }) => ({
  mode,
  entry: './src/index.js',
  devtool: mode === 'development' ? 'inline-source-map' : false,
  performance: {
    hints: mode === 'development' ? false : 'error',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  stats: 'minimal',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  devServer: {
    open: true,
    overlay: {
      warnings: false,
      errors: true
    }
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.(png|jp(e*)g|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          },
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              {
                plugins: ['@babel/plugin-proposal-class-properties']
              }
            ]
          },
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        // SVG
        test: /\.svg$/i,
        oneOf: [
          // When referenced in CSS, they are inlined and encoded with the url-loader package.
          {
            issuer: /\.s[ac]ss$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  generator: (content) => svgToMiniDataURI(content.toString()),
                },
              },
            ]
          },
          // If you want to import into a JS/TS file as an encoded string for use inside of a <img /> element, append ?inline to the import.
          // Example: import icon from './icon.svg?inline'
          {
            resourceQuery: /inline/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  generator: (content) => svgToMiniDataURI(content.toString()),
                },
              },
            ]
          },
          // When imported into a JS/TS file, they are imported as React Components exposing the full markup of the SVG.
          {
            use: [
              babelLoader,
              {
                loader: 'react-svg-loader'
              }
            ]
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  }
});
