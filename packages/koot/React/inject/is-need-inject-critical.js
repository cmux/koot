/**
 * 检查 template 是否需要自动添加针对 critical 的注入
 * @param {String} template
 * @returns {Object}
 */
module.exports = (template = '') => {
    return {
        styles: !/(content|pathname)\(['"]critical\.css['"]\)/.test(template),
        scripts: !/(content|pathname)\(['"]critical\.js['"]\)/.test(template),
    }
}
