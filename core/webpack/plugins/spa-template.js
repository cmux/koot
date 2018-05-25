// https://github.com/jantimon/html-webpack-plugin

const fs = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const chalk = require('chalk')

const writeChunkmap = require('../../../utils/write-chunkmap')
const inject = require('../../../ReactSPA/inject')

class SpaTemplatePlugin {
    constructor({
        localeId,
    }) {
        this.localeId = localeId
    }

    apply(compiler) {

        const localeId = this.localeId
        const hookStep = process.env.WEBPACK_BUILD_ENV === 'prod' ? 'afterEmit' : 'emit'

        compiler.hooks[hookStep].tapAsync.bind(compiler.hooks[hookStep], 'SpaTemplatePlugin')(async (compilation, callback) => {
            if (typeof process.env.SUPER_HTML_TEMPLATE !== 'string') {
                console.log(
                    chalk.red('× ')
                    + chalk.yellowBright('[super/build] ')
                    + 'template not exist'
                )
                return
            }

            const chunkmap = await writeChunkmap(compilation.getStats())
            const filename = `index${localeId ? `.${localeId}` : ''}.html`
            const html = ejs.render(
                process.env.SUPER_HTML_TEMPLATE, {
                    inject: inject({ localeId, chunkmap, compilation })
                }, {

                }
            )

            { // 写入 Webpack 文件流
                // const basename = path.basename(filename)
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
                // console.log(
                //     chalk.green('√ ')
                //     + chalk.yellowBright('[super/build] ')
                //     + 'template output to '
                //     + chalk.green(`/${filename}`)
                // )
            }

            callback()
        })
    }
}

module.exports = SpaTemplatePlugin
