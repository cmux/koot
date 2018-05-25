const path = require('path')

module.exports = (compilation) => {
    if (typeof compilation === 'object' &&
        typeof compilation.getStats === 'function' &&
        typeof compilation.assets === 'object'
    ) {
        const filemap = {}
        const stats = compilation.getStats()

        for (let id in stats.compilation.chunks) {
            const o = stats.compilation.chunks[id]
            if (typeof o.name === 'undefined' || o.name === null) continue
            if (Array.isArray(o.files)) {
                o.files
                    .filter(filename => !/\.(js|css)\.map$/i.test(filename))
                    .forEach(filename => {
                        const extname = path.extname(filename)
                        const file = o.name + extname
                        if (typeof filemap[file] !== 'string')
                            filemap[file] = filename
                    })
            }
        }
        return filemap
    }

    return undefined
}
