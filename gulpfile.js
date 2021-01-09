const { src, dest } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
exports.default  = function() {
    return src('src/*.js')
        .pipe(babel({"plugins": ["@babel/plugin-transform-modules-umd"]}))
        .pipe(uglify())
        .pipe(dest('dist/'));
}
