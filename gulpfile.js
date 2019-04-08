const gulp = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const nunjucks = require('gulp-nunjucks-render');
const data = require('gulp-data');
const dotenv = require('dotenv').config();
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const gulpSequence = require('gulp-sequence');
const fs = require('fs');
const yamlImport = require('yaml-import');
const path = require('path');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCss = require('gulp-clean-css');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const outputDir = 'dist/';
const transDir = 'src/trans/';
let publicDir = 'public/';

const enableTrans = process.env.ENABLE_TRANS === 'TRUE';

gulp.task('nunjucksRender', function () {
    // check for .env
    if (dotenv.error) {
        throw dotenv.error;
    }

    let render = function (trans = []) {
        gulp.src('src/templates/*.html.njk')
            .pipe(plumber())
            .pipe(data(trans))
            .pipe(nunjucks({
                path: ['src/templates/'],
                ext: '',
                data: {},
                inheritExtension: false,
                envOptions: {
                    watch: false
                },
                manageEnv: function (environment) {
                    environment.addGlobal('asset', function (str) {
                        if (str[0] === '/') {
                            throw new Error('Asset path must not begin with "/".');
                        }

                        if (enableTrans) {
                            return '../' + publicDir + str;
                        }

                        return publicDir + str;
                    });

                    environment.addGlobal('path', function (str) {
                        if (str[0] === '/') {
                            throw new Error('Path must not begin with "/".');
                        }

                        return str;
                    });

                    environment.addGlobal('projectTitle', 'Maria Angelidou Graphic Designer');
                },
                loaders: null
            }))
            .pipe(rename({prefix: enableTrans && trans ? '/' + trans.locale + '/' : ''}))
            .pipe(gulp.dest(outputDir));
    };

    // if trans are disable then render english
    if (!enableTrans) {
        render(yamlImport.read(path.join(__dirname, transDir + 'en/en.yaml')));

        return gulp;
    }

    // loop through directories in src/trans/
    fs.readdirSync(transDir).forEach(file => {
        if (!(fs.lstatSync(transDir + file).isDirectory() && file.length === 2)) {
            throw new Error('src/trans/ must contain only directories.');
        }

        render(yamlImport.read(path.join(__dirname, transDir + file + '/' + file + '.yaml')));
    });

    return gulp;
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: outputDir,
            index: 'index.html'
        },
        middleware: [
            function (req, res, next) {
                if (enableTrans && req.url === '/') {
                    res.writeHead(302, {
                        'Location': '/en/index.html'
                    });

                    res.end();
                }

                return next();
            }
        ],
        port: process.env.PORT,
        notify: false,
        open: false,
        scrollRestoreTechnique: 'cookie'
    });

    gulp.watch(['src/scss/*.scss'], ['build-theme']);
    gulp.watch(['src/**/*'], ['nunjucksRender']).on('change', browserSync.reload);
});

gulp.task('clean', function () {
    return del(['dist/**/*', '!dist/public/**']);
});

gulp.task('build-theme', function() {
    return gulp.src(['src/scss/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ autoprefixer({ browsers: [
                'Chrome >= 35',
                'Firefox >= 38',
                'Edge >= 12',
                'Explorer >= 10',
                'iOS >= 8',
                'Safari >= 8',
                'Android 2.3',
                'Android >= 4',
                'Opera >= 12']})]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outputDir + publicDir + 'css/'))
        .pipe(cleanCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(outputDir + publicDir + 'css/'))
});

gulp.task('build', gulpSequence('clean', 'build-theme', 'nunjucksRender'));

gulp.task('run', gulpSequence('clean', 'build-theme', 'nunjucksRender', 'browserSync'));
