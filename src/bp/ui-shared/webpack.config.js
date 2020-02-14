process.traceDeprecation = true

const chalk = require('chalk')
const webpack = require('webpack')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const isProduction = process.env.NODE_ENV === 'production'
const moment = require('moment')

const config = {
  cache: false,
  mode: isProduction ? 'production' : 'development',
  bail: true,
  devtool: process.argv.find(x => x.toLowerCase() === '--nomap') ? false : 'source-map',
  entry: ['./src/index.tsx'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index2.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.css']
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: [
          { loader: 'thread-loader' },
          {
            loader: 'babel-loader',
            options: {
              presets: ['stage-3', ['env', { targets: { browsers: ['last 2 versions'] } }], 'react'],
              plugins: ['transform-class-properties'],
              compact: true,
              babelrc: false,
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-modules-typescript-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          },
          { loader: 'postcss-loader' },
          { loader: 'stylus-loader' }
        ]
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-modules-typescript-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              url: false,
              importLoaders: 1,
              localIdentName: '[name]__[local]___[hash:base64:5]'
            }
          },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}

if (process.argv.find(x => x.toLowerCase() === '--analyze')) {
  config.plugins.push(new BundleAnalyzerPlugin())
}

const compiler = webpack(config)
const postProcess = (err, stats) => {
  if (err) {
    throw err
  }

  console.log(`[${moment().format('HH:mm:ss')}] Studio ${chalk.grey(stats.toString('minimal'))}`)
}

if (process.argv.indexOf('--watch') !== -1) {
  compiler.watch(
    {
      ignored: ['*', /!.\/src/]
    },
    postProcess
  )
}

module.exports = { web: config }
