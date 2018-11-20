/**
 * 通过 compilation 对象检查该次打包是否**仅**为热更新刷新
 * @param {Object} compilation webpack compilation 对象。也可以直接传入 compilation stats 对象
 * @returns {Boolean}
 */
module.exports = (compilation) => {
    // 热更新仅在开发模式启用
    // 如果 compilation 非法，返回
    if (process.env.WEBPACK_BUILD_ENV !== 'dev' ||
        typeof compilation !== 'object'
    )
        return false

    /** @type {Object} compilation stats */
    const stats = typeof compilation.getStats === 'function'
        ? compilation.getStats()
        : compilation

    // 判断 stats 合法性
    if (typeof stats !== 'object' ||
        typeof stats.compilation !== 'object' ||
        !(stats.compilation.entrypoints instanceof Map)
    )
        return false

    // 如果该次打包的入口文件列表中没有 client，判断为热更新
    if (!stats.compilation.entrypoints.has('client'))
        return true

    /** @type {Object} client 入口的 chunks 对象 */
    const chunks = stats.compilation.entrypoints.get('client').chunks

    // 如果 client chunks 为空，判断为热更新
    if (!Array.isArray(chunks))
        return true

    // 如果某一个 chunk 的文件列表中所有的文件的文件名均有 .hot-update. 字段，判断为热更新
    return chunks.some(chunk => {
        const files = chunk.files
        if (!Array.isArray(files))
            return false
        return files.every(filename => filename.includes('.hot-update.'))
    })
}
