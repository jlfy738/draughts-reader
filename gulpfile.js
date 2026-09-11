const fs = require('fs');
const gulp = require('gulp');
const esbuild = require('esbuild');

const entryPoint = './src/main.js';
const outDir = './dist';

function clean(cb) {
    fs.rmSync(outDir, { recursive: true, force: true });
    cb();
}

function bundle() {
    return esbuild.build({
        entryPoints: [entryPoint],
        outfile: `${outDir}/draughts-reader.js`,
        bundle: true,
        platform: 'browser',
        format: 'iife',
        target: ['es2017'],
    });
}

function bundleMin() {
    return esbuild.build({
        entryPoints: [entryPoint],
        outfile: `${outDir}/draughts-reader.min.js`,
        bundle: true,
        minify: true,
        platform: 'browser',
        format: 'iife',
        target: ['es2017'],
    });
}

const build = gulp.series(clean, gulp.parallel(bundle, bundleMin));

exports.clean = clean;
exports.build = build;
exports.default = build;
