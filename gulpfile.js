"use strict";

var gulp       	 = require("gulp"), 
	sass         = require("gulp-sass"),
	plumber 	 = require("gulp-plumber"), 
	browserSync  = require("browser-sync"), 
	concat       = require("gulp-concat"),
	posthtml 	 = require("gulp-posthtml"),
	include 	 = require("posthtml-include"),
	htmlmin 	 = require("gulp-htmlmin"), 
	uglify       = require("gulp-uglify"),
	sourcemaps 	 = require("gulp-sourcemaps"), 
	csso 		 = require("gulp-csso"),
	postcss 	 = require("gulp-postcss"), 
	rename       = require("gulp-rename"),
	svgmin 		 = require("gulp-svgmin"),
	del          = require("del"),
	imagemin     = require("gulp-imagemin"),  
	autoprefixer = require("autoprefixer");

gulp.task("style", function() { 
	return gulp.src("source/sass/partials/**/*.scss")
		.pipe(plumber())
		.pipe(sourcemaps.init()) 
		.pipe(sass()) 
		.pipe(postcss([
			autoprefixer('last 15 versions')
			])) 
		.pipe(concat("main.css")) 
		.pipe(gulp.dest("source/css")) 
		.pipe(csso())
		.pipe(rename("main.min.css"))
		.pipe(gulp.dest("source/css"))
		.pipe(sourcemaps.write())
		.pipe(browserSync.reload({stream: true}));
});

gulp.task("index", function() {
	return gulp.src("source/*.html")
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task("browser-sync", function() { 
	browserSync({
		server: { 
			baseDir: "source" 
		},
		notify: false
	});
});

gulp.task("scripts", function(end) {
	return gulp.src("source/js/partials/*.js")
		.pipe(concat("main.js"))
		.pipe(uglify()) 
		.pipe(rename("main.min.js"))
		.pipe(gulp.dest("source/js")),
		end; 
});

gulp.task("watch", function() {
	gulp.watch("source/sass/**/*.scss", gulp.parallel("style")); 
	gulp.watch("source/*.html", gulp.parallel("index")); 
	gulp.watch("source/js/**/main.min.js", gulp.parallel("scripts")); 
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      minifyJS: true,
      minifyURLs: true,
      collapseWhitespace: true,
      removeComments: true,
      sortAttributes: true,
      sortClassName: true
    }))
    .pipe(gulp.dest("built"))
    .pipe(sourcemaps.write());
});

gulp.task("clean", async function() {
	return del.sync("built"); 
});

gulp.task("images", function() {
	return gulp.src("source/img/images/**/*.{png,jpg}") 
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true})
		]))
		.pipe(gulp.dest("built/img/images")); 
});

gulp.task("svg", function () {
  return gulp.src("source/img/icons/**/*.svg")
    .pipe(svgmin())
    .pipe(gulp.dest("built/img/icons"));
});

gulp.task("prebuild", async function() {

	var builtCss = gulp.src("source/css/main.min.css")
	.pipe(gulp.dest("built/css"))

	var builtFonts = gulp.src("source/fonts/**/*") 
	.pipe(gulp.dest("built/fonts"))

	var builtJs = gulp.src("source/js/main.min.js") 
	.pipe(gulp.dest("built/js"))

});

gulp.task("default", gulp.parallel("index", "style", "scripts", "browser-sync", "watch"));
gulp.task("built", gulp.series("clean", "html", "images", "svg", "prebuild"));