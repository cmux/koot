const path = require('path');

/*
  'id',               'ids',
  'debugId',          'name',
  'idNameHints',      'preventIntegration',
  'filenameTemplate', '_groups',
  'runtime',          'files',
  'auxiliaryFiles',   'rendered',
  'hash',             'contentHash',
  'renderedHash',     'chunkReason',
  'extraAsync'
*/

/**
 * 从 Webpack compilation 数据中生成文件对应表 (Filemap)
 * @param {Object} compilation
 * @param {String} [dirRelative]
 * @returns {Object} 文件对应表 (Filemap)
 */
module.exports = (compilation, dirRelative) => {
    if (typeof compilation !== 'object') return undefined;

    const filemap = {};
    // const stats = compilation.getStats();

    // for (const chunk of stats.compilation.chunks) {
    for (const chunk of compilation.chunks) {
        const { name, idNameHints, files } = chunk;

        const thisName = name || [...idNameHints][0];

        if (typeof thisName === 'undefined' || thisName === null) continue;
        if ([...files].every((filename) => !/\.(js|css)$/i.test(filename)))
            continue;

        // console.log({ name, id, ids, debugId, idNameHints, files });
        // console.log([...idNameHints]);

        [...files]
            .filter((filename) => !/\.(js|css)\.map$/i.test(filename))
            .forEach((filename) => {
                const extname = path.extname(filename);
                const file = thisName + extname;
                if (typeof filemap[file] !== 'string')
                    filemap[file] =
                        process.env.WEBPACK_BUILD_ENV === 'dev'
                            ? filename
                            : (dirRelative ? dirRelative + '/' : '') + filename;
            });
    }

    return filemap;
};
