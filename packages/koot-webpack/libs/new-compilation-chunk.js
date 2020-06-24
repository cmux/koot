const Chunk = require('webpack/lib/Chunk');

/**
 * 向 compilation 对象中添加新的 chunk
 * @param {Object} compilation
 * @param {string} filename
 * @param {string} [id]
 * @returns {Object} compilation
 */
module.exports = (compilation, filename, id) => {
    if (typeof compilation !== 'object')
        throw new Error('invalid parameter: compilation');
    if (typeof filename !== 'string')
        throw new Error('invalid parameter: filename');

    const chunk = new Chunk(filename);
    if (!id)
        id = Array.isArray(compilation.chunks)
            ? compilation.chunks.length
            : compilation.chunks.size;
    chunk.files = [filename];
    chunk.id = id;
    chunk.ids = [id];

    if (Array.isArray(compilation.chunks)) {
        compilation.chunks.push(chunk);
    } else {
        compilation.chunks.add(chunk);
    }

    return compilation;
};
