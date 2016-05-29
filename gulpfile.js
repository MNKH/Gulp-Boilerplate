var gulp = require('gulp'), // Сам Gulp
    watch = require('gulp-watch'), // Следит за изменениями в наших файлах
    prefixer = require('gulp-autoprefixer'), // Добавляет префиксы к нашим стилям
    uglify = require('gulp-uglify'), // Минификация JS-кода
    sass = require('gulp-sass'), // Препроцессор для CSS
    rigger = require('gulp-rigger'), // Делает простое импортирование одного файла в другой
    imagemin = require('gulp-imagemin'), // Сжатие картинок
    pngquant = require('imagemin-pngquant'), // Плагин для ImageMin
    spritesmith = require('gulp.spritesmith'), // Собирает все иконки в один png-файл
    rimraf = require('rimraf'), // Делает rm -rf
    browserSync = require("browser-sync"), // Веб-сервер
    reload = browserSync.reload;


var path = {
   // Наша папка для продакшена
    build: {
        html: './',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
   // Папка с исходными файлами
    src: {
        html: 'src/*.html',
        js: 'src/js/*.js',
        style: 'src/style/*.sass',
        img: 'src/img/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    // Конфиги для вотчера
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.sass',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
   // Очистка папки build, при запуске команды build
    clean: '/build'
};

// Настройки веб-сервера
var config = {
    server: {
        baseDir: "./"
    },
    host: 'localhost',
    port: 9000
};

gulp.task('webserver', function () {
    browserSync(config);
});
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
// HTML + Rigger
gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});
// JS + Rigger
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});
// Sass + Autoprefixer
gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            sourceMap: false,
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(prefixer())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});
// Спрайты
gulp.task('sprite', function() {
    var spriteData =
        gulp.src('./src/img/sprite/*.*') // Путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                cssFormat: 'scss',
                algorithm: 'binary-tree',
                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }
            }));
    spriteData.img.pipe(gulp.dest('./src/img/')); // Путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('./src/style/partials/')); // Путь, куда сохраняем стили
});
// Оптимизания изображений
gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});
// Ctrl+c, ctrl+v для шрифтов (копирует шрифты с src/fonts в build/fonts)
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'sprite',
    'image:build',
]);
// Отслеживание изменений в файлах
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});
// Запуск gulp-проекта
gulp.task('default', ['build', 'webserver', 'watch']);