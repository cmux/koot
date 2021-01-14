const path = require('path');

/**
 * 从 Webpack compilation 数据中生成文件对应表 (Filemap)
 * @param {Object} compilation
 * @param {String} [dirRelative]
 * @returns {Object} 文件对应表 (Filemap)
 */
module.exports = (compilation, dirRelative) => {
    if (typeof compilation !== 'object') return undefined;

    const filemap = {};
    const stats = compilation.getStats();

    for (const chunk of stats.compilation.chunks) {
        if (typeof chunk.name === 'undefined' || chunk.name === null) continue;

        const files = Array.isArray(chunk.files)
            ? chunk.files
            : chunk.files instanceof Set
            ? [...chunk.files]
            : [];

        files
            .filter((filename) => !/\.(js|css)\.map$/i.test(filename))
            .forEach((filename) => {
                const extname = path.extname(filename);
                const file = chunk.name + extname;
                if (typeof filemap[file] !== 'string')
                    filemap[file] =
                        process.env.WEBPACK_BUILD_ENV === 'dev'
                            ? filename
                            : (dirRelative ? dirRelative + '/' : '') + filename;
            });
    }

    return filemap;
};
