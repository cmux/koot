const { sources } = require('webpack');

/**
 * **Webpack 5** 输出文件
 * @param {Object} compilation
 * @param {String} filename
 * @param {String} content
 * @returns {Object} compilation
 */
module.exports = (compilation, filename, content = '', { chunkName } = {}) => {
    if (typeof compilation !== 'object')
        throw new Error('invalid parameter: compilation');
    if (typeof filename !== 'string')
        throw new Error('invalid parameter: filename');

    if (compilation.getAsset(filename)) {
        compilation.updateAsset(
            filename,
            new sources.RawSource(content, false)
        );
    } else {
        // 添加 chunk
        const chunk = compilation.addChunk(chunkName || filename);
        const id = compilation.chunks.size;
        chunk.files.add(filename);
        chunk.id = id;
        chunk.ids = [id];

        compilation.emitAsset(filename, new sources.RawSource(content, false));
    }

    return compilation;
};
