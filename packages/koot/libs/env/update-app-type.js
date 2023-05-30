/**
 * 根据 projectType，更新相关环境变量
 * @param {String} projectType
 * @returns {String} projectType
 */
const updateAppType = (projectType = '') => {
    switch (projectType.toLowerCase()) {
        case 'reactapp': {
            // if ((await readBuildConfigFile()).server)
            process.env.WEBPACK_BUILD_TYPE = 'isomorphic';
            process.env.KOOT_PROJECT_TYPE = 'ReactApp';
            // return 'ReactSPA'
            break;
        }

        case 'reactspa': {
            process.env.WEBPACK_BUILD_TYPE = 'spa';
            process.env.KOOT_PROJECT_TYPE = 'ReactSPA';
            break;
        }

        case 'reactelectronspa': {
            process.env.WEBPACK_BUILD_TYPE = 'spa';
            process.env.KOOT_PROJECT_TYPE = 'ReactElectronSPA';
            process.env.KOOT_BUILD_TARGET = 'electron';
            break;
        }

        case 'reactqiankunspa': {
            process.env.WEBPACK_BUILD_TYPE = 'spa';
            process.env.KOOT_PROJECT_TYPE = 'ReactQiankunSPA';
            process.env.KOOT_BUILD_TARGET = 'qiankun';
            break;
        }

        default: {
        }
        // return process.env.KOOT_PROJECT_TYPE
    }

    return projectType;
};

export default updateAppType;
