import sanitize from 'sanitize-filename';

/**
 * 根据输入的 type，返回代码中使用的项目类型的正确值
 * @param {String} type
 * @returns {String}
 */
const getAppTypeString = (type) => {
    const typeId = sanitize(type).toLowerCase().replace(/[-_]/g, '');
    switch (typeId) {
        case 'isomorphic':
        case 'react':
        case 'reactisomorphic':
        case 'reactapp': {
            return 'ReactApp';
        }

        case 'spa':
        case 'reactspa': {
            return 'ReactSPA';
        }

        case 'electron':
        case 'reactelectronspa':
        case 'reactelectron':
        case 'electronspa': {
            return 'ReactElectronSPA';
        }

        case 'qiankun':
        case 'reactqiankunspa':
        case 'reactqiankun':
        case 'qiankunspa': {
            return 'ReactQiankunSPA';
        }

        default: {
        }
        //     return process.env.KOOT_PROJECT_TYPE
    }
};

export default getAppTypeString;
