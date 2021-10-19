const { src, dest, watch, series, parallel } = require('gulp')
const autoprefixer = require('autoprefixer')
const browserSync = require('browser-sync')
const config = require('./config')
const del = require('del')
const fibers = require('fibers')
const imagemin = require('gulp-imagemin')
const imageminGif = require('imagemin-gifsicle')
const imageminSvg = require('imagemin-svgo')
const mozjpeg = require('imagemin-mozjpeg')
const plumber = require('gulp-plumber')
const pngquant = require('imagemin-pngquant')
const postcss = require('gulp-postcss')
const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const webpackStream = require('webpack-stream')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config')

// HTML
// =====================================================
const html = (done) => {
  src(`${config.tasks.html.src}`).pipe(dest(`${config.tasks.html.dest}`))
  done()
}

// SCSS
// =====================================================
const compileScss = (done) => {
  const postcssPlugins = [
    autoprefixer({
      cascade: false
    })
  ]

  src(`${config.tasks.scss.src}`, `!${config.tasks.scss.exc}`)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: config.envProduction ? 'compressed' : 'expanded',
        fiber: fibers
      }).on('error', sass.logError)
    )
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write())
    .pipe(dest(config.tasks.scss.dest))
  done()
}

// images
// =====================================================
const imageMin = (done) => {
  src(`${config.tasks.images.src}/**/*`)
    .pipe(
      imagemin([
        pngquant({
          quality: [0.6, 0.8]
        }),
        mozjpeg({
          quality: 85,
          progressive: true
        }),
        imageminGif({
          interlaced: false,
          optimizationLevel: 3,
          colors: 180
        }),
        imageminSvg()
      ])
    )
    // 圧縮したファイルの吐き出し先のパス
    .pipe(dest(`${config.tasks.images.dest}`))
  done()
}

// webpack
// =====================================================
const compileJavascript = (done) => {
  src(config.tasks.webpack.src)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(dest(config.tasks.webpack.dest))
  done()
}

// Clean
// =====================================================
const clean = (cb) => {
  return del(config.tasks.clean, cb)
}

// Server
// =====================================================
const server = (done) => {
  browserSync.init(config.tasks.server.browserSyncOptions)
  done()
}

// Watch
// =====================================================
const watchFile = (done) => {
  watch(config.tasks.watch.html, html).on('change', browserSync.reload)
  watch(config.tasks.watch.css, compileScss).on('change', browserSync.reload)
  watch(config.tasks.watch.webpack, compileJavascript).on(
    'change',
    browserSync.reload
  )
  watch(config.tasks.watch.image, imageMin).on('change', browserSync.reload)
  done()
}

// Tasks
// =====================================================
exports.default = series(
  parallel(imageMin, compileScss, html, compileJavascript),
  server,
  watchFile
)

exports.dev = series(
  parallel(imageMin, compileScss, html, compileJavascript),
  server,
  watchFile
)

exports.build = series(
  clean,
  parallel(imageMin, compileScss, html, compileJavascript)
)
