/* eslint-disable import/no-anonymous-default-export */
import { typesSPA } from '../../../defaults/before-build.js';

import '../../../typedef.js';

/**
 * 配置转换 - 兼容性处理 - templateInject
 * @async
 * @param {AppConfig} config
 * @void
 */
export default async (config) => {
    if (typeof config.templateInject !== 'undefined') {
        delete config.inject;
        if (typeof config.server === 'object') delete config.server.inject;
        return;
    }

    if (typesSPA.includes(config.type)) {
        if (typeof config.inject !== 'undefined') {
            config.templateInject = config.inject;
            delete config.inject;
        } else if (typeof config.server === 'object') {
            config.templateInject = config.server.inject;
            delete config.server.inject;
        }
        return;
    }

    if (
        typeof config.server === 'object' &&
        typeof config.server.inject !== 'undefined'
    ) {
        config.templateInject = config.server.inject;
        delete config.server.inject;
    } else {
        config.templateInject = config.inject;
    }
    delete config.inject;
};
