const webpack = require('webpack');
const {
    keyConfigWebpackSPATemplateInject,
} = require('koot/defaults/before-build');

/**
 * 执行打包: client
 * @async
 * @param {Object} config
 * @returns {Promise}
 */
const webpackBuildClient = async (config = {}) => {
    delete config[keyConfigWebpackSPATemplateInject];

    const compiler = webpack(config);
    // console.log('compiler')

    return new Promise((resolve, reject) => {
        try {
            compiler.run((...args) => {
                if (typeof compiler.close === 'function')
                    compiler.close(() => {
                        resolve(...args);
                    });
                else resolve(...args);
            });
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = webpackBuildClient;
