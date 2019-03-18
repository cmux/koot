/**
 * 修改 package.json: 更新依赖信息
 * @async
 * @param {String} dir 路径
 * @param {String} moduleName 依赖包名
 * @param {String|Boolean} [version] 版本号。若不填写则临时获取最新版本号。若为 `false` 则表示删除该依赖。
 * @param {DependencyType} [type] 类型
 * @returns {Array} 修改的文件列表
 */
const modifyPackageDependency = async (dir, moduleName, version, type) => {

}

module.exports = modifyPackageDependency

/**
 * @typedef {String} DependencyType
 * @value undefined (默认值) 添加/修改为默认依赖（dependencies）
 * @value 'dev' 添加/修改为开发依赖（devDependencies）
 * @value 'peer' 添加/修改为同级依赖（peerDependencies）
 * @value 'optional' 添加/修改为可选依赖（optionalDependencies）
 */
