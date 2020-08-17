const safeguard = require('../../libs/safeguard');

/**
 * 针对所有命令：在正式开始打包之前
 * @param {Object} appConfig
 */
module.exports = async (appConfig) => {
    await safeguard(appConfig);
};
