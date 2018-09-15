var gulp = require('gulp'); // Gulp çağırılıyor.
var sass = require('gulp-sass'); // SASS compiler
var browserSync = require('browser-sync').create(); // Browser synchronization for watch...
var cache = require('gulp-cache'); //C ache'i temizler.
var del = require('del'); // Dist klasörünü temizlemek ve tamamen kaldırmak için kullanılır.
var runSequence = require('run-sequence'); // Taskların çalışma önceliğini belirler...
var autoprefixer = require('gulp-autoprefixer'); // Adding vendor prefixes to the CSS files
var sourcemaps = require('gulp-sourcemaps'); // dist klasöründeki CSS çıktısına sourcemap ekliyor!
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
  // gulp-sass kullanarak Sass dosyasını CSS'e çeviriyor. (nested, compact, expanded, compressed)
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'expanded'})).on("error", function swallowError (error) {
    console.log(error.toString())
    this.emit('end')
  })
  .pipe(sourcemaps.write())
  .pipe(autoprefixer({browsers: ['last 1 version', 'iOS 6'], cascade: false})) // CSS dosyasına prefixler ekleniyor...
  .pipe(gulp.dest('src/assets/css'))
  .pipe(browserSync.reload({
    stream: true
  }))
});

// BrowserSync'i çalıştırıyor.
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
  })
});

// Imajları dist klasörüne taşır.
gulp.task('images', function(){
  return gulp.src('src/assets/images/**/*.+(png|jpg|gif|svg)')
  .pipe(gulp.dest('dist/assets/images'))
});

// Fontları dist klasörüne taşır.
gulp.task('fonts', function(){
  return gulp.src('src/assets/fonts/**/*')
  .pipe(gulp.dest('dist/assets/fonts'))
});

// CSS dosyalarını dist klasörüne taşır.
gulp.task('css', function(){
  return gulp.src('src/assets/css/**/*.css')
    .pipe(gulp.dest('dist/assets/css/'));
});

// HTML dosyalarını dist klasörüne taşır.
gulp.task('html', function(){
  return gulp.src('src/*.html')
  .pipe(gulp.dest('dist'))
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
    ['sass', 'css', 'images', 'fonts', 'html'],
    callback
  )
});
