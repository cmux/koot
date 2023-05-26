/* eslint-disable import/no-anonymous-default-export */

import factoryConfig from './_factory.js';

export default async () => {
    const defaults = await factoryConfig();

    // 针对开发环境的定制配置
    const config = {};

    return Object.assign({}, defaults, config);
};
