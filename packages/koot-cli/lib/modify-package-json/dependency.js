const fs = require('fs-extra')
const path = require('path')
const latestVersion = require('latest-version')

/**
 * 修改 package.json: 更新依赖信息
 * @async
 * @param {String} dir 路径
 * @param {String} moduleName 依赖包名
 * @param {String|Boolean} [version] 版本号。若不填写则临时获取最新版本号。若为 `false` 则表示删除该依赖。
 * @param {DependencyType} [type] 类型
 * @returns {Array} 修改的文件列表
 */
const modifyPackageDependency = async (dir, moduleName, version, type = '') => {

    if (typeof dir !== 'string')
        throw new Error('`dir` not valid')

    if (typeof moduleName !== 'string')
        throw new Error('`moduleName` not valid')

    /** @type {String} package.json 文件路径 */
    const filePackage = path.resolve(dir, 'package.json')
    if (!fs.existsSync(filePackage))
        throw new Error('`package.json` not found in target directory')

    /** @type {Object} package.json JSON 内容 */
    const p = await fs.readJson(filePackage, { throws: false })
        .catch(() => {
            throw new Error('`package.json` not valid JSON file')
        })
    if (typeof p !== 'object')
        throw new Error('`package.json` not valid JSON file')

    /** @type {String} 依赖类型名 */
    const typeKey = (type => {
        if (/^dev/.test(type)) return 'devDependencies'
        if (/^peer/.test(type)) return 'peerDependencies'
        if (/^optional/.test(type)) return 'optionalDependencies'
        return 'dependencies'
    })(type.toLowerCase())

    // 检查对应类型在 package.json 中是否存在，如果不存在，新建
    if (typeof p[typeKey] !== 'object')
        p[typeKey] = {}

    if (version === false) {
        // 如果版本号为 false，表示删除
        delete p[typeKey][moduleName]
    } else {
        // 如果没有给定版本号，检查最新版本号
        if (!version)
            version = await latestVersion(moduleName)
        p[typeKey][moduleName] = version
    }

    // 写入文件
    await fs.writeJSON(filePackage, p, { spaces: 4 })

    return ['package.json']
}

module.exports = modifyPackageDependency

/**
 * @typedef {String} DependencyType
 * @value undefined (默认值) 添加/修改为默认依赖（dependencies）
 * @value 'dev' 添加/修改为开发依赖（devDependencies）
 * @value 'peer' 添加/修改为同级依赖（peerDependencies）
 * @value 'optional' 添加/修改为可选依赖（optionalDependencies）
 */
