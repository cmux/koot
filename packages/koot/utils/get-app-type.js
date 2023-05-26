import fs from 'fs';

import getPathnameProjectConfigFile from './get-pathname-project-config-file.js';
// import readBuildConfigFile from '../utils/read-build-config-file.js';
import getAppTypeString from './get-app-type-string.js';
import envUpdateAppType from '../libs/env/update-app-type.js';
import getAppConfig from './get-app-config.js';

const extractType = async () => {
    const pathnameKootJS = getPathnameProjectConfigFile();

    try {
        const { type } = await getAppConfig(pathnameKootJS);
        return type;
    } catch (e) {}

    const content = fs.readFileSync(pathnameKootJS, 'utf-8');
    const matches = /type[ ]*=[ ]*['"](.+?)['"]/gm.exec(content);
    if (Array.isArray(matches) && matches.length > 1) return matches[1];

    return undefined;
};

/**
 * 根据 KOOT_PROJECT_TYPE 环境变量确定项目类型 (type)，并修改/写入以下环境变量
 *   - WEBPACK_BUILD_TYPE: 'isomorphic' || 'spa' || etc...
 *   - KOOT_PROJECT_TYPE: 'ReactApp' || 'ReactSPA' || etc...
 *
 * 如果该环境变量未指定或为空值，则会尝试从项目配置中读取
 *
 * 项目配置：在 0.6 之前为 koot.js，0.6 之后为自动生成的临时配置文件
 *   - 使用临时配置文件是为了兼容 0.6 之前的行为
 *   - TODO: 在未来可能会抛弃独立配置文件行为，界时该方法会改写
 *
 * @async
 * @param {String} [projectType] 指定项目类型，如果指定会强制采用该值
 * @returns {String} process.env.KOOT_PROJECT_TYPE
 */
const getAppType = async (projectType = process.env.KOOT_PROJECT_TYPE) => {
    if (!projectType) {
        projectType = (await extractType()) || '';
    }

    envUpdateAppType(getAppTypeString(projectType));

    return process.env.KOOT_PROJECT_TYPE;
};

export default getAppType;
