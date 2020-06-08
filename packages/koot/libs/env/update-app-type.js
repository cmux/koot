/**
 * 根据 projectType，更新相关环境变量
 * @param {String} projectType
 * @returns {String} projectType
 */
module.exports = (projectType = '') => {
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
            break;
        }

        default: {
        }
        // return process.env.KOOT_PROJECT_TYPE
    }

    return projectType;
};
