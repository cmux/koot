const DefaultWebpackConfig = require('webpack-config').default;

const createTargetDefaultConfig = require('../factory-config/create-target-default');
const transformConfigExtendDefault = require('../factory-config/transform-config-extend-default');

const getCwd = require('koot/utils/get-cwd');

module.exports = async (config, appConfig) => {
    /** @type {Object} 默认配置 */
    const configTargetDefault = await createTargetDefaultConfig({
        pathRun: getCwd(),
        clientDevServerPort: process.env.WEBPACK_DEV_SERVER_PORT,
    });
    const thisConfig = new DefaultWebpackConfig().merge(config);
    if (thisConfig.entry) delete configTargetDefault.entry;
    if (thisConfig.output) delete configTargetDefault.output;
    return new DefaultWebpackConfig()
        .merge(configTargetDefault)
        .merge(await transformConfigExtendDefault(thisConfig, appConfig));
};
