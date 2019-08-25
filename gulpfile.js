var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var nunjucksRender = require('gulp-nunjucks-render');
var babel = require('gulp-babel');

// Babel is transpiling the ES6 codes in "scripts.js" file to old JavaScript and moves it into the "babelified" folder
gulp.task('babelify', () =>
  gulp.src('src/assets/js/scripts.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('src/assets/js/babelified'))
);

// Nunjucks HTML Templating
gulp.task('nunjucks', function () {
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
gulp.task('sass', function () {
  return gulp.src('src/assets/sass/**/*.scss')
    // gulp-sass kullanarak Sass dosyasını CSS'e çeviriyor. (nested, compact, expanded, compressed)
    .pipe(sourcemaps.init())
    .pipe(sass({ 
      outputStyle: 'expanded',
      includePaths: ['./node_modules/susy/sass']
    })).on("error", function swallowError(error) {
      console.log(error.toString())
      this.emit('end')
    })
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({ browsers: ['last 1 version', 'iOS 6'], cascade: false })) // CSS dosyasına prefixler ekleniyor...
    .pipe(gulp.dest('src/assets/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Runs the BrowserSync
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
    port: 8080
  })
});

// Moves all the images into the "dist" folder
gulp.task('images', function () {
  return gulp.src('src/assets/images/**/*.+(png|jpg|gif|svg)')
    .pipe(gulp.dest('dist/assets/images'))
});

// Moves all the font files into the "dist" folder
gulp.task('fonts', function () {
  return gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts'))
});

// Moves all the CSS files into the "dist" folder
gulp.task('css', function () {
  return gulp.src('src/assets/css/**/*.css')
    .pipe(gulp.dest('dist/assets/css/'));
});

// Moves all the Bootstrap related JavaScript files into the js folder 
gulp.task('bootstrapper', function () {
  return gulp.src([
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/jquery/dist/jquery.js',
    'node_modules/popper.js/dist/popper.js'
  ])
    .pipe(gulp.dest('src/assets/js'))
    .pipe(browserSync.stream());
});

// Moves the transpiled "script.js" file into the "dist" folder
gulp.task('js', function () {
  return gulp.src([
    // The ordering is very important here!
    'src/assets/js/*.js', // Firstly, it moves all the js files
    'src/assets/js/babelified/scripts.js' // Secondly, overwrite the "scripts.js" file with the transpiled one
  ])
    .pipe(gulp.dest('dist/assets/js/'));
});

// Moves all the html files into the "dist" folder
gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist'))
});

// Cleans the "dist" folder by removing 
gulp.task('clean:dist', function () {
  return del.sync('dist');
});

// Cleans the cache
gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
})

// Watches the file changes
//gulp.watch('files-to-watch', ['task-to-run']);
gulp.task('start', ['bootstrapper', 'browserSync', 'babelify', 'sass', 'nunjucks'], function () {
  gulp.watch('src/**/*.+(html|njk)', ['nunjucks']);
  gulp.watch('src/assets/sass/**/*.scss', ['sass']);
  gulp.watch('src/assets/js/**/*.js', ['babelify']);
  gulp.watch('src/assets/js/**/*.js', browserSync.reload);
  gulp.watch('src/*.html', browserSync.reload);
  // Put here all the other files that you want to be watched
});

// Tasks are queuing according to their working priority
gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['bootstrapper', 'js', 'sass', 'css', 'images', 'fonts', 'html'],
    callback
  )
});
