const resetCssLoader = require('../loaders/css/reset');

/**
 * Webpack 插件 - 重置 `koot-css-loader` 计数器
 */
class ResetCssLoaderPlugin {
    apply(compiler) {
        compiler.hooks.done.tapAsync.bind(
            compiler.hooks.done,
            'ResetCssLoaderPlugin'
        )((compilation, callback) => {
            if (process.env.WEBPACK_BUILD_ENV === 'prod') resetCssLoader();
            callback();
        });
    }
}

module.exports = ResetCssLoaderPlugin;
