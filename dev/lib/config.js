const path = require('path')
const webpack = require('webpack')
const MiniHTMLWebpackPlugin = require('mini-html-webpack-plugin')
const merge = require('webpack-merge')

const htmlTemplate = require('./html-template')

const babel = {
  presets: [
    'babel-preset-env',
    'babel-preset-stage-0',
    'babel-preset-react',
  ].map(require.resolve),
  plugins: [
    'babel-plugin-transform-runtime'
  ].map(require.resolve)
}

const baseConfig = {
  mode: 'development',
  stats: 'none',
  entry: [ path.join(__dirname, './entry') ],
  output: {
    path: process.cwd(),
    filename: 'dev.js'
  },
  resolve: {
    modules: [
      __dirname,
      path.join(__dirname, '../node_modules'),
      'node_modules'
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          options: babel
        }
      },
      {
        test: /\.js$/,
        exclude: path.resolve(__dirname, '../node_modules'),
        include: path.resolve(__dirname),
        use: {
          loader: require.resolve('babel-loader'),
          options: babel
        }
      },
      {
        test: /\.jsx$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: babel
          },
          {
            loader: require.resolve(
              path.join(__dirname, './scope-loader')
            ),
            options: {}
          },
          require.resolve(
            path.join(__dirname, './jsx-loader')
          ),
        ]
      },
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: babel
          },
          {
            loader: require.resolve(
              path.join(__dirname, './scope-loader')
            ),
            options: {}
          },
          require.resolve(
            path.join(__dirname, './mdx-loader')
          ),
        ]
      }
    ]
  },
  node: {
    fs: 'empty'
  },
  plugins: []
}

const mergeConfigs = (config, opts) => {
  const userWebpack = opts.webpack ? require(opts.webpack) : {}
  const userConfig = typeof userWebpack === 'function' ? userWebpack(Object.assign({}, config)) : {}
  return merge(config, userConfig)
}

const getDevConfig = opts => {
  const config = Object.assign({}, baseConfig)
  config.resolve.modules.unshift(
    opts.dirname,
    path.join(process.cwd(), 'node_modules'),
    path.join(opts.dirname, 'node_modules'),
  )

  const defs = new webpack.DefinePlugin({
    DIRNAME: JSON.stringify(opts.dirname),
    CONFIG: JSON.stringify(opts.config),
    OPTIONS: JSON.stringify(opts),
  })

  config.plugins.push(defs)

  config.plugins.push(
    new MiniHTMLWebpackPlugin({
      context: opts,
      template: htmlTemplate
    })
  )

  if (opts._config) {
    config.module.rules[2].use[1].options = opts._config
    config.module.rules[2].use[1].options.config = opts.config
    config.module.rules[3].use[1].options = opts._config
    config.module.rules[3].use[1].options.config = opts.config
  }

  return mergeConfigs(config, opts)
}

module.exports = getDevConfig