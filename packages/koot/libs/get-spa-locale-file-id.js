const md5 = require('md5');

/**
 * SPA 项目语言包脚本的 _Webpack_ 入口 ID
 * @param {string} localeId
 * @returns {string}
 */
module.exports = localeId => md5(`koot-spa-locale-file-${localeId}`);
