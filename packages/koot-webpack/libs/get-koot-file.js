const fs = require('fs-extra')
const path = require('path')

/**
 * 获取 koot 内指定文件的路径名
 * @param {String} pathname
 * @returns {String}
 */
module.exports = (pathname) => {
    const file = path.resolve(dirKoot, pathname)
    if (fs.existsSync(file)) return file
    throw new Error(`File "${pathname}" not found in "koot"`)
}

/**
 * 检查给定的文件路径是不是文件夹
 * @param {String} pathname 
 * @returns {Boolean}
 */
const fileIsDirectory = (pathname) => Boolean(
    fs.existsSync(pathname) && 
    fs.lstatSync(pathname).isDirectory()
)


const dirKoot = (() => {
    let d = path.resolve(__dirname, '../../koot')
    if (fileIsDirectory(d)) return d

    d = path.resolve(__dirname, '../node_modules/koot')
    if (fileIsDirectory(d)) return d

    throw new Error('NPM package "koot" not installed')
})()
