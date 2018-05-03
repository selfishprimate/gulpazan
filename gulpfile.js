var gulp = require('gulp'); //Gulp'ı çağırır.
var sass = require('gulp-sass'); // gulp-sass pluginini çağırır.
var browserSync = require('browser-sync').create(); //BrowserSync'i çağırır.
var useref = require('gulp-useref'); //JavaScript ve CSS dosyalarını birleştirmek için kullanılan plugin.
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano'); // CSS Minifier
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin'); //Imaj optimizasyonu...
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence'); // Taskların çalışma önceliğini belirler...
var autoprefixer = require('gulp-autoprefixer'); // CSS Autoprefixer
var minifyCss = require('gulp-minify-css'); // CSS dosyasını minidy ediyor.
var sourcemaps = require('gulp-sourcemaps'); // dist klasöründeki CSS çıktısına sourcemap ekliyor!
var inject = require('gulp-inject');
var nunjucksRender = require('gulp-nunjucks-render'); // HTML templating için kullanılıyor.

// Nunjucks HTML Templating
gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('dev/pages/**/*.+(html|njk)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['dev/templates']
    }))
  // output files in dev folder
  .pipe(gulp.dest('dev'))
});

// Sass Compile
gulp.task('sass', function() {
  return gulp.src('dev/assets/sass/**/*.scss')
  .pipe(sass()) // gulp-sass kullanarak Sass dosyasını CSS'e çeviriyor.
  .pipe(autoprefixer({browsers: ['last 1 version', 'iOS 6'], cascade: false})) // CSS dosyasına prefixler ekleniyor...
  .pipe(gulp.dest('dev/assets/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// CSS Minify
gulp.task('minify', function(){
  gulp.src(['dev/assets/css/**/*.css'])
  .pipe(sourcemaps.init())
  .pipe(minifyCss())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('dist/assets/css/'))
});

// BrowserSync'i çalıştırıyor.
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dev'
    },
  })
});

// gulp-useref ile farklı JavaScript ve CSS dosyaları birleştirilip sıkıştırılıyor.
gulp.task('useref', function(){
  return gulp.src('dev/*.html')
    .pipe(useref())
    // Sadece JavaScript dosyası ise minify et!
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'))
});

// Imajları optimize etmek ve taşımak için...
gulp.task('images', function(){
  return gulp.src('dev/assets/images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin({
    interlaced: true
  })))
  .pipe(gulp.dest('dist/assets/images'))
});

// Fontları taşımak için...
gulp.task('fonts', function(){
  return gulp.src('dev/assets/fonts/**/*')
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
gulp.task('watch', ['browserSync', 'sass', 'nunjucks'], function(){
  gulp.watch('dev/**/*.+(html|njk)', ['nunjucks']);
  gulp.watch('dev/assets/sass/**/*.scss', ['sass']);
  gulp.watch('dev/assets/js/**/*.js', browserSync.reload);
  gulp.watch('dev/*.html', browserSync.reload);
  // İzlemek istediğiniz diğer uglamalar.
});

// Tasklar, çalışma önceliğine göre sıraya konuluyor...
gulp.task('build', function(callback) {
  runSequence('clean:dist',
    ['sass', 'minify', 'useref', 'images', 'fonts'],
    callback
  )
});
