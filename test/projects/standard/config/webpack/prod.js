const factoryConfig = require('./_factory');
// const webpackOptimizationProd = require('koot/utils/webpack-optimization-prod');

module.exports = async () => {
    const defaults = await factoryConfig();

    // 针对生产环境的定制配置
    const config = {
        output: {
            // path: path.resolve(__dirname, '../../dist/public/aaa'),
            // publicPath: "/aaa/",
            filename: `core.[chunkhash].js`,
            chunkFilename: `chunk.[chunkhash].js`
        }

        // optimization: webpackOptimizationProd()
    };

    return Object.assign({}, defaults, config);
};
