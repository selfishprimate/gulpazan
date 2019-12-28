const { series, watch, src, dest, parallel } = require('gulp');

const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const cache = require("gulp-cache");
const del = require("del");
const runSequence = require("run-sequence");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const nunjucksRender = require("gulp-nunjucks-render");
const babel = require("gulp-babel");

function babelify() {
  return src('src/assets/js/scripts.js')
    .pipe(babel({ presets: ["@babel/env"] }))
    .pipe(gulp.dest("src/assets/js/babelified"))
}

function nunjucks() {
  return src('src/pages/**/*.+(html|njk)')
    .pipe(nunjucksRender({ path: ["src/templates"] }))
    .pipe(gulp.dest("src"))
}

function sassify() {
  return src('src/assets/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({ outputStyle: 'expanded', includePaths: ['./node_modules/susy/sass'] })
    ).on('error', function swallowError(error) {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({ browsers: ['last 1 version', 'iOS 6'], cascade: false }))
    .pipe(browserSync.reload({ stream: true }))
}

function syncBrowser() {
  browserSync.init({
    server: { baseDir: 'src' },
    port: 8080
  })
}
function images() {
  return src('src/assets/images/**/*.+(png|jpg|gif|svg)')
    .pipe(dest('dist/assets/images'))
}

function fonts() {
  return src('src/assets/fonts/**/*')
    .pipe(dest('dist/assets/fonts'))
}

function css() {
  return src('src/assets/css/**/*.css')
    .pipe(dest('dist/assets/css/'))
}

function bootstrapper() {
  return src(['node_modules/bootstrap/dist/js/bootstrap.js', 'node_modules/jquery/dist/jquery.js', 'node_modules/popper.js/dist/popper.js'])
    .pipe(dest('src/assets/js'))
    .pipe(browserSync.stream())
}

function js() {
  return src(['src/assets/js/*.js', 'src/assets/js/babelified/scripts.js'])
    .pipe(dest('dist/assets/js/'))
}

function html() {
  return src('src/*.html')
    .pipe(dest('dist'))
}

function cleanDist() {
  return del.sync('dist');
}

function cleanCache(callback) {
  return cache.clearAll(callback)
}

function start() {
  series(bootstrapper, syncBrowser, babelify, sassify, nunjucks)
  watch('src/**/*.+(html|njk)', nunjucks)
  watch('src/assets/sass/**/*.scss', sassify)
  watch('src/assets/js/**/*.js', babelify)
  watch('src/assets/js/**/*.js', browserSync.reload)
  watch('src/*.html', browserSync.reload)
}

function build(callback) {
  runSequence(cleanDist, ["bootstrapper", "js", "sassify", "css", "images", "fonts", "html"], callback)
}


exports.start = start;
exports.build = build;