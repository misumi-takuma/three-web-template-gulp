const minimist = require('minimist')

const envSettings = {
  string: 'env',
  default: {
    env: process.env.NODE_ENV || 'development'
  }
}

const options = minimist(process.argv.slice(2), envSettings)
const production = options.env === 'production'

const config = {
  dirs: {
    src: './src',
    dest: './dest'
  },
  envProduction: production
}

const tasks = {
  html: {
    src: `${config.dirs.src}/html/**/*.html`,
    dest: `${config.dirs.dest}`
  },
  scss: {
    src: `${config.dirs.src}/scss/style.scss`,
    dest: `${config.dirs.dest}/css`
  },
  webpack: {
    src: `${config.dirs.src}/js/index.js`,
    dest: `${config.dirs.dest}/js`,
    filename: 'bundle.js'
  },
  watch: {
    html: [`${config.dirs.src}/html/**/*.html`],
    css: [`${config.dirs.src}/scss/**/*.scss`],
    image: [`${config.dirs.src}/images/**/*`],
    webpack: [`${config.dirs.src}/js/**/*.js`]
  },
  images: {
    src: `${config.dirs.src}/images`,
    dest: `${config.dirs.dest}/images`
  },
  fonts: {
    src: `${config.dirs.src}/fonts/**/*`,
    dest: `${config.dirs.dest}/fonts`
  },
  server: {
    browserSyncOptions: {
      server: {
        baseDir: `${config.dirs.dest}`
      },
      open: 'external'
    }
  },
  clean: [config.dirs.dest]
}

config.tasks = tasks
module.exports = config
