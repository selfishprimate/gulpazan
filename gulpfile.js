const { series, src, dest, watch } = require('gulp');
const nunjucksRender = require("gulp-nunjucks-render");
const browserSync = require("browser-sync");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const del = require('del');
const cache = require("gulp-cache");
const data = require('gulp-data'); // This plugin calls the JSON data file.
const fs = require('fs'); // Using for the JSON parsing...

// Nunjucks HTML templating engine
function nunjucks(done) {
  return src('src/pages/**/*.njk')
    .pipe(data(function () { return JSON.parse(fs.readFileSync('src/public/assets/data/data.json')) }))
    .pipe(nunjucksRender({ path: ['src/templates'] }))
    .pipe(dest('src/public'))
  done()
}

// Sass compiler
function sassify(done) {
  return src('src/public/assets/sass/**/*.scss')
    .pipe(sourcemaps.init())
    // gulp-sass kullanarak Sass dosyasını CSS'e çeviriyor. (nested, compact, expanded, compressed)
    .pipe(sass({ outputStyle: 'expanded' })).on('error', function swallowError(error) {
      console.log(error.toString());
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(dest('src/public/assets/css'))
    .pipe(browserSync.reload({ stream: true }))
  done()
}

function browser_sync(done) {
  browserSync.init({
    watch: true,
    server: { baseDir: 'src/public' },
    port: 5000
  })
  done()
}

// Moves all the Bootstrap related JavaScript files into the js folder
function bootstrapper(done) {
  return src(['node_modules/bootstrap/dist/js/bootstrap.js', 'node_modules/jquery/dist/jquery.js', 'node_modules/popper.js/dist/popper.js'])
    .pipe(dest('src/public/assets/js'))
    .pipe(browserSync.stream())
  done()
}

function html() {
  return src('src/public/*.html')
    .pipe(dest('dist'))
}

function images() {
  return src('src/public/assets/images/**/*.+(png|jpg|gif|svg)')
    .pipe(dest('dist/assets/images'))
}

function fonts() {
  return src('src/public/assets/fonts/**/*')
    .pipe(dest('dist/assets/fonts'))
}

function css() {
  return src('src/public/assets/css/**/*.css')
    .pipe(dest('dist/assets/css/'))
}

function js() {
  // The ordering is very important here!
  // First it moves all the js files
  // Second it overwrites the "scripts.js" file with the transpiled one
  return src('src/public/assets/js/**/*.js')
    .pipe(dest('dist/assets/js/'))
}

// Deletes the dist folder
function clean_dist() {
  return del('./dist');
}

// Cleans the cache
function clear_cache(done) {
  return cache.clearAll(done)
}

function watch_files(done) {
  watch('src/**/*.njk', nunjucks)
  watch('src/**/*.json', nunjucks)
  watch('src/**/*.scss', sassify)
  watch('src/**/*.html', browserSync.reload)
  done()
}

exports.start = series(clear_cache, bootstrapper, browser_sync, sassify, nunjucks, watch_files);
exports.build = series(clean_dist, bootstrapper, js, sassify, css, images, fonts, html);