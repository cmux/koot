const fs = require('fs-extra')
const path = require('path')

module.exports = async (stats, localeId) => {
    const {
        SUPER_DIST_DIR: dist
    } = process.env

    const chunks = {}

    const times = n => f => {
        let iter = i => {
            if (i === n) return
            f(i)
            iter(i + 1)
        }
        return iter(0)
    }

    const log = (obj, spaceCount = 1, deep = 2) => {
        if (typeof obj === 'object') {
            let spaces = ''
            times(spaceCount)(() => {
                spaces += '    '
            })
            for (let key in obj) {
                console.log(spaces + key)
                if (spaceCount < deep)
                    log(obj[key], spaceCount + 1, deep)
            }
        }
    }

    const dirRelative = path.relative(
        dist,
        stats.compilation.outputOptions.path
    ).replace(`\\`, '/')

    // for (let key in stats.compilation) {
    //     console.log(key)
    // }

    if (stats.compilation.entrypoints) {
        const entryChunks = {}
        stats.compilation.entrypoints.forEach((value, key) => {
            // console.log(value, key, map)
            entryChunks[key] = []
            value.chunks.forEach(chunk => {
                if (Array.isArray(chunk.files))
                    chunk.files.forEach(file => entryChunks[key].push(`${dirRelative}/${file}`))
            })
        })
        chunks['.entrypoints'] = entryChunks
    }
    for (let id in stats.compilation.chunks) {
        const o = stats.compilation.chunks[id]
        if (typeof o.name === 'undefined' || o.name === null) continue
        chunks[o.name] = o.files

        if (Array.isArray(chunks[o.name]))
            chunks[o.name] = chunks[o.name].map(file => (
                `${dirRelative}/${file}`
            ))
    }

    const file = path.resolve(
        // stats.compilation.outputOptions.path,
        dist,
        `.public-chunkmap.json`
    )
    let json = {}

    if (localeId) {
        json = fs.readJsonSync(file)
        json[`.${localeId}`] = chunks
    } else {
        json = chunks
    }

    await fs.writeJsonSync(
        file,
        json,
        {
            spaces: 4
        }
    )

    return json
}
