const { src, dest, watch, series } = require("gulp");
const sync = require("browser-sync").create();

function browserSync(cb) {
  sync.init({
    server: {
      baseDir: ".",
    },
    open: false,
  });
  watch("./*.html").on("change", sync.reload);
  watch("./assets/css/**/*.css").on("change", sync.reload);
  watch("./assets/js/**/*.js").on("change", sync.reload);
}
exports.sync = browserSync;
exports.default = exports.sync;
exports.dev = browserSync;
