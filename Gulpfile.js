'use strict';
/****************************************
    DEPENDENCIES
*****************************************/
/*
 * This list of dependency variables comes from the package.json file. Ensure any dependency listed here is also added to package.json.
 * These variables are declared here at the top and are used throughout the gulpfile to complete certain tasks and add functionality.
 */
const fs = require('fs');
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync').create();
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const path = require('path');
const merge = require('merge-stream');

/****************************************
    SOURCE PATHS
*****************************************/
/**
 * The 'config' object defines where all the assets are found.
 * Changing the values of this object will change where all the tasks below look for files
 */

// Common defaults
const path_src = './assets/src/';
const path_dist = './assets/dist/';

// Pathing config
const config = {
    theme: {
        name: 'power_dist', // if you change this value, update your file enqueue's too. This is a prefix for all file names (usage example: config.theme.name)
    },
    css: {
        sass: path_src + 'sass/style.scss',
        sass_comps: path_src + 'sass/**/*.scss',
        sass_sections: './sections/**/*.scss',
        vendor_src: path_src + 'vendor/css/**/*.css',
        dist: path_dist + 'css/',
    },
    js: {
        src: [
            path_src + 'js/**/*.js', // Wildcard - Used as a catch-all. This will add all .js files located within assets/src/js/ to be compiled.
            // path_src + 'js/main.js', // Manual - FOR DEPENDENCIES - if you want to control your enqueue order, manually add each file in the order you'd like
        ],
        src_sections: [
            './sections/**/*.js', // Wildcard - Used as a catch-all. This will add all .js files located within assets/src/js/ to be compiled.
            // './template-parts/blocks/custom-content/custom-content.js', // Manual - FOR DEPENDENCIES - if you want to control your enqueue order, manually add each file in the order you'd like
        ],
        src_sections_min: './sections/',
        src_vendor: [
            path_src + 'vendor/js/**/*.js', // Wildcard - used as a catch-all. This will add all .js files located within assets/src/vendor/js/ to be compiled and minfied.
        ],
        dist: path_dist + 'js/',
    },
    imgs: {
        src: [
            path_src + 'imgs/*.jpg',
            path_src + 'imgs/*.jpeg',
            path_src + 'imgs/*.png',
            path_src + 'imgs/*.gif',
            path_src + 'imgs/*.svg',
            path_src + 'imgs/**/*.jpg',
            path_src + 'imgs/**/*.jpeg',
            path_src + 'imgs/**/*.png',
            path_src + 'imgs/**/*.gif',
            path_src + 'imgs/**/*.svg',
        ],
        dist: path_dist + 'imgs/',
    },
    docs: {
        serve: './assets/docs',
        index: './assets/src/docs/index.html',
        json: './assets/src/docs/jsdoc.json',
    },
};

/****************************************
    HELPER FUNCTIONS
*****************************************/
/**
 * Get subfolders within directory
 * source: https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
 * - Used for Block Scripts
 *
 * @param {*} dir
 */
function getFolders(dir) {
    return fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
    });
}

/****************************************
    STANDARD TASKS
*****************************************/

/**
 * COMPILE GLOBAL SASS :: UN-MINIFIED & MINIFIED
 */
function styles() {
    // Define plugins for "PostCSS"
    var plugins_expanded = [autoprefixer()];
    var plugins_min = [cssnano()];

    // Run SASS Task
    return (
        gulp
            .src(config.css.sass)
            .pipe(
                plumber(
                    {
                        errorHandler: notify.onError(
                            'SASS Global Error: <%= error.message %>'
                        ),
                    } // on error, send push
                )
            )
            .pipe(sourcemaps.init()) // Begin SCSS mapping
            .pipe(
                sass({
                    outputStyle: 'expanded',
                })
            )
            .pipe(postcss(plugins_expanded))
            .pipe(sourcemaps.write()) // Write SCSS maps
            .pipe(rename(config.theme.name + '-custom.css'))
            .pipe(gulp.dest(config.css.dist)) // DIST un-minified file

            // minify for production
            //   .pipe(rename(config.theme.name + "-custom.min.css")) // rename with .min
            //   .pipe(postcss(plugins_min)) // minify
            .pipe(gulp.dest(config.css.dist))
    ); // DIST minified version
}

/**
 * COMPILE & MINIFY VENDOR & MISC CSS
 */
function styles_vendor() {
    return gulp
        .src(config.css.vendor_src)
        .pipe(
            plumber(
                {
                    errorHandler: notify.onError(
                        'Vendor CSS Error: <%= error.message %>'
                    ),
                } // on error, send push
            )
        )
        .pipe(concat(config.theme.name + '-vendor.min.css')) // group files together
        .pipe(postcss([cssnano()])) // minify
        .pipe(gulp.dest(config.css.dist)); // DIST minified version
}

/**
 * COMPILE CUSTOM JS :: UN-MINIFIED & MINIFIED
 */
function scripts_global() {
    return gulp
        .src(config.js.src)
        .pipe(
            plumber(
                {
                    errorHandler: notify.onError(
                        'JS Global Error: <%= error.message %>'
                    ),
                } // on error, send push
            )
        )
        .pipe(concat(config.theme.name + '-custom.js')) // group files together
        .pipe(gulp.dest(config.js.dist)); // DIST un-minified file

    //    minify for production
    //   .pipe(rename(config.theme.name + "-custom.min.js")) // rename with .min
    //   .pipe(uglify()) // minify
    //.pipe(gulp.dest(config.js.dist)) // DIST minified version
}

/**
 * COMPILE & MINIFY VENDOR JS
 */
function scripts_vendor() {
    return (
        gulp
            .src(config.js.src_vendor)
            .pipe(
                plumber(
                    {
                        errorHandler: notify.onError(
                            'Vendor JS Error: <%= error.message %>'
                        ),
                    } // on error, send push
                )
            )
            .pipe(concat(config.theme.name + '-vendor.js')) // group files together
            .pipe(gulp.dest(config.js.dist)) // DIST un-minified file

            // minify for production
            .pipe(rename(config.theme.name + '-vendor.min.js')) // rename with .min
            .pipe(uglify()) // minify
            .pipe(gulp.dest(config.js.dist))
    ); // DIST minified version
}

/**
 * OPTIMIZE IMAGES & DIST TO THEME
 */
function images() {
    return gulp
        .src(config.imgs.src)
        .pipe(
            plumber(
                {
                    errorHandler: notify.onError(
                        'Images Error: <%= error.message %>'
                    ),
                } // on error, send push
            )
        )
        .pipe(newer(config.imgs.dist)) // check DIST for existing assets
        .pipe(
            imagemin([
                // optimize images per image type
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        {
                            removeViewBox: false,
                            collapseGroups: true,
                        },
                    ],
                }),
            ])
        )
        .pipe(gulp.dest(config.imgs.dist)); // DIST optimized versions
}
/****************************************
    DEFINED TASKS
*****************************************/

/**
 * BROWSER SYNC
 *
 * https://browsersync.io/docs/gulp
 * This will not reload the browser on every change
 * It will just output an IP that is available to any device on the network.
 * Meant for Testing PC and Devices.
 */
function browser_sync(done) {
    browsersync.init({
        proxy: 'http://wp.test:8888', // replace yoursitename with the url of your local site.
        open: false,
    });
    done();
}

/**
 * COMMAND LINE
 *
 * Define a command to run (you may need to 'cd' into the correct directory first)
 */
let shell_cmd = 'echo sample command_line command;';
shell_cmd += 'echo sample 2nd command;'; // Can be a series of commands seperated by ';'

// Run command_line var
gulp.task(
    'command_line',
    shell.task(shell_cmd, {
        shell: 'bash',
    })
);

/****************************************
    ACTIONS
*****************************************/

// BUILD TASK - COMPILES SCSS, CSS & JS, but does NOT watch for file changes
const build = gulp.series([
    styles_vendor,
    styles,
    scripts_vendor,
    scripts_global,
    images,
]);

// WATCH AND LOG SOURCE FILE CHANGES
function watch() {
    // WATCH SASS / CSS
    gulp.watch(config.css.sass, gulp.series([styles])).on('change', (event) => {
        console.log('File ' + event + ' was updated, running tasks...');
    });
    gulp.watch(config.css.sass_comps, gulp.series([styles])).on(
        'change',
        (event) => {
            console.log('File ' + event + ' was updated, running tasks...');
        }
    );
    gulp.watch(config.css.sass_sections, gulp.series([styles])).on(
        'change',
        (event) => {
            console.log(
                'File ' + event + ' was updated was it, running tasks...'
            );
        }
    );
    gulp.watch(config.css.vendor_src, gulp.series([styles_vendor])).on(
        'change',
        (event) => {
            console.log('File ' + event + ' was updated, running tasks...');
        }
    );

    // WATCH JS
    gulp.watch(config.js.src, gulp.series([scripts_global])).on(
        'change',
        (event) => {
            console.log('File ' + event + ' was updated, running tasks...');
        }
    );
    gulp.watch(config.js.src_vendor, gulp.series([scripts_vendor])).on(
        'change',
        (event) => {
            console.log('File ' + event + ' was updated, running tasks...');
        }
    );

    // WATCH IMAGES
    gulp.watch(config.imgs.src, gulp.series([images])).on('change', (event) => {
        console.log('File ' + event + ' was updated, running tasks...');
    });
}

// DEFAULT GULP TASK
const start = gulp.series([build, watch]);

/****************************************
    EXPORTS
*****************************************/
exports.styles = styles;
exports.styles_vendor = styles_vendor;
exports.scripts_global = scripts_global;
exports.scripts_vendor = scripts_vendor;
exports.images = images;
exports.browser_sync = browser_sync;
exports.build = build;
exports.watch = watch;
exports.default = start;
