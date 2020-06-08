/* eslint-disable no-console */
// ref: https://github.com/jantimon/html-webpack-plugin

const fs = require('fs-extra');
const path = require('path');
// const ejs = require('ejs')
const chalk = require('chalk');

const { buildManifestFilename } = require('koot/defaults/before-build');
const writeChunkmap = require('koot/utils/write-chunkmap');
const getAppType = require('koot/utils/get-app-type');
const __ = require('koot/utils/translate');
const getDistPath = require('koot/utils/get-dist-path');
const getCwd = require('koot/utils/get-cwd');
const getChunkmap = require('koot/utils/get-chunkmap');
const getDirDistPublic = require('koot/libs/get-dir-dist-public');
const validateTemplate = require('koot/libs/validate-template');
const getSpaLocaleFileId = require('koot/libs/get-spa-locale-file-id');
const generateHtmlRedirectMetas = require('koot/i18n/generate-html-redirect-metas');

const newCompilationFileDependency = require('../libs/new-compilation-file-dependency');

// ============================================================================

/**
 * Webpack 插件 - 生成 SPA 主页面文件
 * @class SpaTemplatePlugin
 * @classdesc Webpack 插件 - 生成 SPA 主页面文件
 * @property {String} localeId
 */
class SpaTemplatePlugin {
    constructor(settings = {}) {
        this.localeId = settings.localeId;
        this.inject = settings.inject;
        this.template = settings.template;
        this.serviceWorkerPathname = settings.serviceWorkerPathname;
        this.locales = settings.locales;
    }

    apply(compiler) {
        const {
            localeId,
            inject,
            template,
            serviceWorkerPathname,
            locales,
        } = this;

        const filename = `index${localeId ? `.${localeId}` : ''}.html`;

        // 失败原因
        let fail = false;

        // 如果环境变量中未找到模板结果，分析 koot.js，获取结果
        if (!process.env.KOOT_HTML_TEMPLATE) {
            compiler.hooks.compilation.tap(
                'SpaTemplatePlugin',
                (compilation, { normalModuleFactory }) => {
                    const handler = (parser) => {
                        // for (let key in parser.hooks) console.log(key)

                        parser.hooks.varDeclaration
                            .for('template')
                            .tap('SpaTemplatePlugin', function (/*node*/) {
                                // console.log(node)
                                compilation.modules.forEach((m) => {
                                    if (
                                        typeof m.resource === 'string' &&
                                        typeof m._source === 'object' &&
                                        /[/\\]koot\.js$/.test(m.resource)
                                    ) {
                                        const exec = /template[ *]=[ *]['"](.+?)['"]/.exec(
                                            m._source._value
                                        );
                                        if (
                                            Array.isArray(exec) &&
                                            exec.length > 1
                                        ) {
                                            const t = exec[1];
                                            if (t.substr(0, 2) === './') {
                                                process.env.KOOT_HTML_TEMPLATE = fs.readFileSync(
                                                    path.resolve(getCwd(), t),
                                                    'utf-8'
                                                );
                                            } else {
                                                process.env.KOOT_HTML_TEMPLATE = t;
                                            }
                                        }
                                    }
                                });
                            });
                    };

                    normalModuleFactory.hooks.parser
                        .for('javascript/auto')
                        .tap('SpaTemplatePlugin', handler);
                    normalModuleFactory.hooks.parser
                        .for('javascript/dynamic')
                        .tap('SpaTemplatePlugin', handler);
                    normalModuleFactory.hooks.parser
                        .for('javascript/esm')
                        .tap('SpaTemplatePlugin', handler);
                }
            );
        }

        // [生产环境] emit - 添加占位文件
        if (process.env.WEBPACK_BUILD_ENV === 'prod') {
            compiler.hooks.emit.tapAsync.bind(
                compiler.hooks.emit,
                'SpaTemplatePlugin'
            )(async (compilation, callback) => {
                newCompilationFileDependency(compilation, filename, '');
                newCompilationFileDependency(
                    compilation,
                    buildManifestFilename,
                    ''
                );
                callback();
            });
        }

        // hook: 在文件吐出时修改模板文件代码
        const hookStep =
            process.env.WEBPACK_BUILD_ENV === 'prod' ? 'afterEmit' : 'emit';
        compiler.hooks[hookStep].tapAsync.bind(
            compiler.hooks[hookStep],
            'SpaTemplatePlugin'
        )(async (compilation, callback) => {
            const appType = await getAppType();
            const isI18nEnabled = Array.isArray(locales) && locales.length;

            // 获取并写入 chunkmap
            await writeChunkmap(
                compilation,
                localeId,
                undefined,
                serviceWorkerPathname
            );

            const {
                '.files': filemap,
                '.entrypoints': entrypoints,
                // 'service-worker': serviceWorker
            } = getChunkmap(localeId, false, true);

            // console.log({
            //     serviceWorker,
            //     KOOT_PWA_PATHNAME: process.env.KOOT_PWA_PATHNAME
            // });

            // 如果环境变量中未找到模板结果，报错并返回
            if (typeof process.env.KOOT_HTML_TEMPLATE !== 'string') {
                fail = __('build.spa_template_not_found');
                return callback();
            }
            const templateStr =
                process.env.WEBPACK_BUILD_ENV === 'dev'
                    ? await validateTemplate(template)
                    : process.env.KOOT_HTML_TEMPLATE;

            const renderTemplate = (() => {
                switch (appType) {
                    case 'ReactSPA':
                    case 'ReactElectronSPA': {
                        return require(`koot/React/render-template`);
                    }
                    default: {
                    }
                }
                return () => '';
            })();
            const defaultInject = (() => {
                switch (appType) {
                    case 'ReactSPA':
                    case 'ReactElectronSPA': {
                        const inject = require(`koot/ReactSPA/inject`)({
                            filemap,
                            compilation,
                            entrypoints,
                            localeId,
                            localeFileMap: isI18nEnabled
                                ? locales.reduce((map, [localeId]) => {
                                      map[localeId] =
                                          filemap[
                                              getSpaLocaleFileId(localeId) +
                                                  '.js'
                                          ];
                                      return map;
                                  }, {})
                                : undefined,
                            defaultLocaleId: isI18nEnabled
                                ? locales[0][0]
                                : undefined,
                            needInjectCritical: require(`koot/React/inject/is-need-inject-critical`)(
                                templateStr
                            ),
                        });
                        return inject;
                    }
                    default: {
                    }
                }
                return {};
            })();
            // console.log(Object.assign({}, defaultInject, inject))

            const projectInject = (() => {
                if (!inject) return {};
                if (typeof inject !== 'string') return {};
                if (!fs.existsSync(inject)) return {};
                return ((thisModule) => {
                    if (typeof thisModule.default === 'object')
                        return thisModule.default;
                    if (typeof thisModule === 'object') return thisModule;
                    return {};
                })(
                    // eslint-disable-next-line no-eval
                    eval(
                        `const __KOOT_LOCALEID__ = '${localeId}';\n` +
                            fs.readFileSync(inject, 'utf-8')
                    )
                );
            })();

            const thisInject = {
                ...defaultInject,
                ...projectInject,
            };
            if (isI18nEnabled)
                thisInject.metas += generateHtmlRedirectMetas({
                    availableLocaleIds: locales.map(([localeId]) => localeId),
                });
            const html = renderTemplate({
                template: templateStr,
                inject: thisInject,
                compilation,
                localeId,
            });

            newCompilationFileDependency(compilation, filename, html);

            // console.log(html)

            // 生产环境：写入文件
            if (process.env.WEBPACK_BUILD_ENV === 'prod') {
                const pathname = path.resolve(
                    getDirDistPublic(getDistPath()),
                    filename
                );
                await fs.ensureFile(pathname);
                await fs.writeFile(pathname, html, 'utf-8');
            }

            callback();
        });

        // hook: done
        compiler.hooks.done.tapAsync.bind(
            compiler.hooks.done,
            'SpaTemplatePlugin'
        )((compilation, callback) => {
            // 生产环境：报告文件写入完成
            if (process.env.WEBPACK_BUILD_ENV === 'prod') {
                setTimeout(() => {
                    console.log('');
                    if (fail) {
                        setTimeout(() => {
                            console.log(
                                chalk.redBright('× ') +
                                    chalk.yellowBright('[koot/build] ') +
                                    chalk.redBright(fail)
                            );
                        });
                    } else {
                        console.log(
                            chalk.green('√ ') +
                                chalk.yellowBright('[koot/build] ') +
                                __('build.spa_template_emitted', {
                                    file: chalk.green(`/${filename}`),
                                })
                        );
                    }
                });
            }

            callback();
        });
    }
}

module.exports = SpaTemplatePlugin;
