/**
 * 向打包文件列表中添加新的内容
 * @param {Object} compilation
 * @param {String} filename
 * @param {String} content
 * @returns {Object} compilation
 */
module.exports = (compilation, filename, content = '') => {
    if (typeof compilation !== 'object')
        throw new Error('invalid parameter: compilation');
    if (typeof filename !== 'string')
        throw new Error('invalid parameter: filename');

    if (compilation.fileDependencies.add) {
        compilation.fileDependencies.add(filename);
    } else {
        // Before Webpack 4 - fileDepenencies was an array
        compilation.fileDependencies.push(filename);
    }
    compilation.assets[filename] = {
        source: () => content,
        size: () => content.length,
    };

    return compilation;
};
