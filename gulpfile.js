var gulp = require('gulp');
var sass = require('gulp-sass'); // SASS compiler
var browserSync = require('browser-sync').create(); // Browser synchronization for watch...
var useref = require('gulp-useref'); // Combining and minifying the JavaScript and the CSS files...
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano'); // CSS minifier...
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin'); // Image optimization...
var cache = require('gulp-cache');
var del = require('del');
var gutil = require("gulp-util");
var runSequence = require('run-sequence'); // Taskların çalışma önceliğini belirler...
var autoprefixer = require('gulp-autoprefixer'); // Adding vendor prefixes to the CSS files
var minifyCss = require('gulp-minify-css'); // Minifying the CSS files
var sourcemaps = require('gulp-sourcemaps'); // dist klasöründeki CSS çıktısına sourcemap ekliyor!
var inject = require('gulp-inject');
var nunjucksRender = require('gulp-nunjucks-render'); // HTML templating için kullanılıyor.

// Nunjucks HTML Templating
gulp.task('nunjucks', function() {
  // Gets .html and .njk files in pages folder...
  return gulp.src('src/pages/**/*.+(html|njk)')
  // Renders template folder with nunjucks...
  .pipe(nunjucksRender({
      path: ['src/templates']
    }))
  // output files in src folder
  .pipe(gulp.dest('src'))
});

// Sass Compile
gulp.task('sass', function() {
  return gulp.src('src/assets/sass/**/*.scss')
  .pipe(sass()) // gulp-sass kullanarak Sass dosyasını CSS'e çeviriyor.
  // sass to css yaparken hata oluşursa log a basıp
  // watch taskın durmasını önlüyor
  .on("error", function swallowError (error) {
    console.log(error.toString())

    this.emit('end')
  })
  .pipe(autoprefixer({browsers: ['last 1 version', 'iOS 6'], cascade: false})) // CSS dosyasına prefixler ekleniyor...
  .pipe(gulp.dest('src/assets/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// CSS Minify
gulp.task('minify', function(){
  gulp.src(['src/assets/css/**/*.css'])
  .pipe(sourcemaps.init())
  .pipe(minifyCss())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist/assets/css/'))
});

// BrowserSync'i çalıştırıyor.
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
  })
});

// gulp-useref ile farklı JavaScript ve CSS dosyaları birleştirilip sıkıştırılıyor.
gulp.task('useref', function(){
  return gulp.src('src/*.html')
    .pipe(useref())
    // Sadece JavaScript dosyası ise minify et!
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
});

// Imajları optimize etmek ve taşımak için...
gulp.task('images', function(){
  return gulp.src('src/assets/images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin({
    interlaced: true
  })))
  .pipe(gulp.dest('dist/assets/images'))
});

// Fontları taşımak için...
gulp.task('fonts', function(){
  return gulp.src('src/assets/fonts/**/*')
  .pipe(gulp.dest('dist/assets/fonts'))
});

// Dist klasörünü temizlemek, tamamen kaldırmak için...
gulp.task('clean:dist', function(){
  return del.sync('dist');
});

// Cache'i temizler...
gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
})

// Watching
//gulp.watch('files-to-watch', ['task-to-run']);
gulp.task('start', ['browserSync', 'sass', 'nunjucks'], function(){
  gulp.watch('src/**/*.+(html|njk)', ['nunjucks']);
  gulp.watch('src/assets/sass/**/*.scss', ['sass']);
  gulp.watch('src/assets/js/**/*.js', browserSync.reload);
  gulp.watch('src/*.html', browserSync.reload);
  // İzlemek istediğiniz diğer uglamalar.
});

// Tasklar, çalışma önceliğine göre sıraya konuluyor...
gulp.task('build', function(callback) {
  runSequence('clean:dist',
    ['sass', 'minify', 'useref', 'images', 'fonts'],
    callback
  )
});
