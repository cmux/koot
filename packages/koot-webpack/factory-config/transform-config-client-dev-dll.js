const path = require('path');
const webpack = require('webpack');
const resolve = require('enhanced-resolve');

const {
    keyConfigBuildDll,
    filenameDll,
    filenameDllManifest
} = require('koot/defaults/before-build');
const defaultModules = require('koot/defaults/dev-dll-modules');
const getDirDevDll = require('koot/libs/get-dir-dev-dll');
const getCwd = require('koot/utils/get-cwd');

// ============================================================================

/** 将目标 _Webpack_ 配置对象转换为 **客户端-开发环境-DLL** 配置 */
const transformClientDevDll = async (
    config = {},
    kootConfigForThisBuild = {}
) => {
    const {
        [keyConfigBuildDll]: createDll = false,
        // dist,
        devDll: webpackDll = []
    } = kootConfigForThisBuild;

    if (!createDll) return config;

    const result = Array.isArray(config) ? { ...config[0] } : { ...config };
    delete result.watch;
    delete result.watchOptions;

    const rawList =
        Array.isArray(webpackDll) && webpackDll.length
            ? webpackDll
            : defaultModules;

    // 如果自行添加了 koot，排除
    if (rawList.includes('koot')) rawList.splice(rawList.indexOf('koot'), 1);

    /** @type {string[]} 依据本地安装的依赖包最终过滤的 DLL 内容列表 */
    const library = [];
    for (const m of rawList) {
        await new Promise(r => {
            resolve(getCwd(), m, (err, result) => {
                if (!err && typeof result === 'string' && !!result)
                    library.push(m);
                r();
            });
        });
    }

    result.entry = {
        library
    };

    // console.log('result.entry.library', result.entry.library)
    result.output = {
        filename: filenameDll,
        library: '[name]_[hash]',
        // path: STAGE === 'server' ? path.resolve(dist, 'server') : dist
        path: getDirDevDll()
    };
    process.env.KOOT_DEV_DLL_FILE_CLIENT = path.resolve(
        getDirDevDll(undefined, 'client'),
        filenameDll
    );
    process.env.KOOT_DEV_DLL_FILE_SERVER = path.resolve(
        getDirDevDll(undefined, 'server'),
        filenameDll
    );
    result.plugins.push(
        new webpack.DllPlugin({
            // context: path.resolve(__dirname, '../../../../'),
            path: path.resolve(result.output.path, filenameDllManifest),
            name: '[name]_[hash]'
        })
    );
    return result;
};

module.exports = transformClientDevDll;
