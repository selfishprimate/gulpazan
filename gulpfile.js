const { series, watch, src, dest, parallel, gulp } = require('gulp');
const del = require('del');
const sass = require("gulp-sass");
const browserSync = require("browser-sync");
const cache = require("gulp-cache");
const sourcemaps = require("gulp-sourcemaps");
const nunjucksRender = require("gulp-nunjucks-render");
const babel = require("gulp-babel");

function babelify(done) {
  return src('src/assets/js/scripts.js')
    .pipe(babel({ presets: ["@babel/env"] }))
    .pipe(dest("src/assets/js/babelified"))
  done()
}

function nunjucks(done) {
  return src('src/pages/**/*.+(html|njk)')
    .pipe(nunjucksRender({
      path: ["src/templates"]
    }))
    .pipe(dest("src"))
  done()
}

function sassify(done) {
  return src('src/assets/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' })).on('error', function swallowError(error) {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(browserSync.reload({ stream: true }))
  done()
}

function browser_sync(done) {
  browserSync.init({
    server: { baseDir: 'src' },
    port: 8080
  })
  done()
}

function bootstrapper(done) {
  return src(['node_modules/bootstrap/dist/js/bootstrap.js', 'node_modules/jquery/dist/jquery.js', 'node_modules/popper.js/dist/popper.js'])
    .pipe(dest('src/assets/js'))
    .pipe(browserSync.stream())
  done()
}

function watch_files(done) {
  watch('src/**/*.+(html|njk)', nunjucks)
  watch('src/assets/sass/**/*.scss', sassify)
  watch('src/assets/js/**/*.js', babelify)
  watch('src/assets/js/**/*.js', browserSync.reload)
  watch('src/*.html', browserSync.reload)
  done()
}

function html() {
  return src('src/*.html')
    .pipe(dest('dist'))
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

function js() {
  return src(['src/assets/js/*.js', 'src/assets/js/babelified/scripts.js'])
    .pipe(dest('dist/assets/js/'))
}

function clean_dist() {
  return del('./dist');
}


exports.default = function () {
  watch('src/**/*.+(html|njk)', nunjucks)
  watch('src/assets/sass/**/*.scss', sassify)
  watch('src/assets/js/**/*.js', babelify)
  watch('src/assets/js/**/*.js', browserSync.reload)
  watch('src/*.html', browserSync.reload)
}


exports.start = series(bootstrapper, browser_sync, babelify, sassify, nunjucks, watch_files);
exports.build = series(clean_dist, bootstrapper, js, sassify, css, images, fonts, html);