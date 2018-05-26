// https://github.com/jantimon/html-webpack-plugin

const fs = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const chalk = require('chalk')

const writeChunkmap = require('../../../utils/write-chunkmap')
const getAppType = require('../../../utils/get-app-type')
const __ = require('../../../utils/translate')

class SpaTemplatePlugin {
    constructor({
        localeId,
    }) {
        this.localeId = localeId
    }

    apply(compiler) {

        const localeId = this.localeId
        const filename = `index${localeId ? `.${localeId}` : ''}.html`

        // hook: 文件吐出
        const hookStep = process.env.WEBPACK_BUILD_ENV === 'prod' ? 'afterEmit' : 'emit'
        compiler.hooks[hookStep].tapAsync.bind(compiler.hooks[hookStep], 'SpaTemplatePlugin')(async (compilation, callback) => {
            const appType = await getAppType()

            // 获取并写入 chunkmap
            const chunkmap = await writeChunkmap(compilation.getStats())

            // 如果环境变量中未找到模板结果，报错并返回
            if (typeof process.env.SUPER_HTML_TEMPLATE !== 'string') {
                console.log(
                    chalk.red('× ')
                    + chalk.yellowBright('[super/build] ')
                    + __('build.spa_template_not_found')
                )
                return callback()
            }

            // 处理环境变量中的模板字符串
            const html = ejs.render(
                process.env.SUPER_HTML_TEMPLATE, {
                    inject: require(`../../../${appType}/inject`)({
                        localeId, chunkmap, compilation
                    })
                }, {

                }
            )

            // 写入 Webpack 文件流
            if (compilation.fileDependencies.add) {
                compilation.fileDependencies.add(filename)
            } else {
                // Before Webpack 4 - fileDepenencies was an array
                compilation.fileDependencies.push(filename)
            }
            compilation.assets[filename] = {
                source: () => html,
                size: () => html.length
            }

            // 生产环境：写入文件
            if (process.env.WEBPACK_BUILD_ENV === 'prod') {
                const pathname = path.resolve(process.env.SUPER_DIST_DIR, 'public/', filename)
                await fs.ensureFile(pathname)
                await fs.writeFile(
                    pathname,
                    html,
                    'utf-8'
                )
            }

            callback()
        })

        // hook: done
        compiler.hooks.done.tapAsync.bind(compiler.hooks.done, 'SpaTemplatePlugin')((compilation, callback) => {
            // 生产环境：报告文件写入完成
            if (process.env.WEBPACK_BUILD_ENV === 'prod') {
                setTimeout(() => {
                    console.log(
                        chalk.green('√ ')
                        + chalk.yellowBright('[super/build] ')
                        + __('build.spa_template_emitted', {
                            file: chalk.green(`/${filename}`)
                        })
                    )
                })
            }

            callback()
        })
    }
}

module.exports = SpaTemplatePlugin
