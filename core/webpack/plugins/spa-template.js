// https://github.com/jantimon/html-webpack-plugin

const fs = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const chalk = require('chalk')

const writeChunkmap = require('../../../utils/write-chunkmap')
const getAppType = require('../../../utils/get-app-type')
const __ = require('../../../utils/translate')
const getDistPath = require('../../../utils/get-dist-path')

class SpaTemplatePlugin {
    constructor(settings = {}) {
        this.localeId = settings.localeId
        this.inject = settings.inject
    }

    apply(compiler) {

        const localeId = this.localeId
        const inject = this.inject
        const filename = `index${localeId ? `.${localeId}` : ''}.html`

        // 失败原因
        let fail = false

        // 如果环境变量中未找到模板结果，分析 super.js，获取结果
        if (!process.env.SUPER_HTML_TEMPLATE) {
            compiler.hooks.compilation.tap(
                "SpaTemplatePlugin",
                (compilation, { normalModuleFactory }) => {
                    const handler = parser => {
                        // for (let key in parser.hooks) console.log(key)

                        parser.hooks.varDeclaration
                            .for("template")
                            .tap("SpaTemplatePlugin", function (/*node*/) {
                                // console.log(node)
                                compilation.modules.forEach(m => {
                                    if (typeof m.resource === 'string' &&
                                        typeof m._source === 'object' &&
                                        /[/\\]super\.js$/.test(m.resource)
                                    ) {
                                        const exec = /template[ *]=[ *]['"](.+?)['"]/.exec(m._source._value)
                                        if (Array.isArray(exec) && exec.length > 1) {
                                            const t = exec[1]
                                            if (t.substr(0, 2) === './') {
                                                process.env.SUPER_HTML_TEMPLATE = fs.readFileSync(path.resolve(
                                                    process.cwd(), t
                                                ), 'utf-8')
                                            } else {
                                                process.env.SUPER_HTML_TEMPLATE = t
                                            }
                                        }
                                    }
                                })
                            })
                    }

                    normalModuleFactory.hooks.parser
                        .for("javascript/auto")
                        .tap("SpaTemplatePlugin", handler)
                    normalModuleFactory.hooks.parser
                        .for("javascript/dynamic")
                        .tap("SpaTemplatePlugin", handler)
                    normalModuleFactory.hooks.parser
                        .for("javascript/esm")
                        .tap("SpaTemplatePlugin", handler)
                }
            )
        }

        // hook: 文件吐出
        const hookStep = process.env.WEBPACK_BUILD_ENV === 'prod' ? 'afterEmit' : 'emit'
        compiler.hooks[hookStep].tapAsync.bind(compiler.hooks[hookStep], 'SpaTemplatePlugin')(async (compilation, callback) => {
            const appType = await getAppType()

            // 获取并写入 chunkmap
            const chunkmap = await writeChunkmap(compilation.getStats())

            // 如果环境变量中未找到模板结果，报错并返回
            if (typeof process.env.SUPER_HTML_TEMPLATE !== 'string') {
                fail = __('build.spa_template_not_found')
                return callback()
            }

            // 处理环境变量中的模板字符串
            const template = process.env.SUPER_HTML_TEMPLATE
            const injectObject = require(`../../../${appType}/inject`)({
                localeId, inject,
                chunkmap,
                compilation,
            })
            try {
                for (let key in injectObject) {
                    if (typeof injectObject[key] === 'function')
                        injectObject[key] = injectObject[key](template)
                }
            } catch (e) {
                console.log(e)
            }
            const html = ejs.render(
                template, {
                    inject: injectObject,
                }, {}
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
                const pathname = path.resolve(getDistPath(), 'public/', filename)
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
                    if (fail) {
                        setTimeout(() => {
                            console.log(
                                chalk.redBright('× ')
                                + chalk.yellowBright('[super/build] ')
                                + chalk.redBright(fail)
                            )
                        })
                    } else {
                        console.log(
                            chalk.green('√ ')
                            + chalk.yellowBright('[super/build] ')
                            + __('build.spa_template_emitted', {
                                file: chalk.green(`/${filename}`)
                            })
                        )
                    }
                })
            }

            callback()
        })
    }
}

module.exports = SpaTemplatePlugin
