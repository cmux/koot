const factoryConfig = require('./_factory');
// const webpackOptimizationProd = require('koot/utils/webpack-optimization-prod');

module.exports = async () => {
    const defaults = await factoryConfig();

    // 针对生产环境的定制配置
    const config = {
        output: {
            // path: path.resolve(__dirname, '../../dist/public/aaa'),
            // publicPath: "/aaa/",
            filename: `${process.env.KOOT_BUILD_START_TIME}.core.[chunkhash].js`,
            chunkFilename: `${process.env.KOOT_BUILD_START_TIME}.chunk.[chunkhash].js`,
        },

        // optimization: webpackOptimizationProd()
    };

    return Object.assign({}, defaults, config);
};
