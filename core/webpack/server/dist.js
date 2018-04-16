const common = require('../common')

const factoryConfig = async ({
    RUN_PATH,
    // CLIENT_DEV_PORT,
}) => {

    // let { RUN_PATH, CLIENT_DEV_PORT, APP_KEY } = opt

    return {
        target: 'async-node',
        node: {
            __dirname: true
        },
        watch: false,
        entry: common.serverEntries(RUN_PATH),
        output: {
            filename: 'index.js',
            chunkFilename: 'chunk.[name].[chunkhash].js',
            path: `${RUN_PATH}/${common.outputPath}/server`,
            publicPath: `/[need_set_in_app:__webpack_public_path__]/`
        },
        plugins: [],
        externals: common.filterExternalsModules(),
    }
}

module.exports = async (opt) => await factoryConfig(opt)
