const fs = require('fs');
const gulp = require('gulp');
const esbuild = require('esbuild');

const outDir = './dist';

const targets = [
    // Default build: dependency-free vanilla JS version.
    { entryPoint: './src/main.js', outfile: 'draughts-reader.js', minOutfile: 'draughts-reader.min.js' },
    // Archived build: legacy JQuery plugin version.
    { entryPoint: './src/main-jquery.js', outfile: 'draughts-reader-jquery.js', minOutfile: 'draughts-reader-jquery.min.js' },
];

function clean(cb) {
    fs.rmSync(outDir, { recursive: true, force: true });
    cb();
}

function makeBundleTask(entryPoint, outfile, minify) {
    return function () {
        return esbuild.build({
            entryPoints: [entryPoint],
            outfile: `${outDir}/${outfile}`,
            bundle: true,
            minify: minify,
            platform: 'browser',
            format: 'iife',
            target: ['es2017'],
        });
    };
}

const bundleTasks = targets.flatMap(function (t) {
    return [
        makeBundleTask(t.entryPoint, t.outfile, false),
        makeBundleTask(t.entryPoint, t.minOutfile, true),
    ];
});

const build = gulp.series(clean, gulp.parallel(bundleTasks));

exports.clean = clean;
exports.build = build;
exports.default = build;
