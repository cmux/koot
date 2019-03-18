
const spinner = require('../../lib/spinner')
const _ = require('../../lib/translate')
const modifyPackageDependency = require('../../lib/modify-package-json/dependency')

const msgUpgrading = require('./msg-upgrading')

module.exports = async (cwd = process.cwd(), prevVersion = '0.7.0') => {

    const msgUpgrading = msgUpgrading(prevVersion, '0.8.0')
    const spinnerUpgrading = spinner(msgUpgrading + '...')
    const filesChanged = ['package.json']

    // TODO: 添加依赖: autoprefixer
    await modifyPackageDependency(cwd, 'autoprefixer', undefined, 'dev')

    // TODO: 修改 src/template.ejs，删除所有 .css 相关的 content() 和 pathname()

    // TODO: 修改 babel.config.js: 删除 "react-hot-loader/babel"

    // TODO: 如果使用早期配置文件，报告

    // 结束
    spinnerUpgrading.stop()
    spinner(msgUpgrading).finish()
}
