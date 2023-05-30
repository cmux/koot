/* eslint-disable import/no-anonymous-default-export */

import md5 from 'md5';

/**
 * SPA 项目语言包脚本的 _Webpack_ 入口 ID
 * @param {string} localeId
 * @returns {string}
 */
export default (localeId) => md5(`koot-spa-locale-file-${localeId}`);
