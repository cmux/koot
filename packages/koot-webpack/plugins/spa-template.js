/* eslint-disable no-console */
// ref: https://github.com/jantimon/html-webpack-plugin

const fs = require('fs-extra');
const path = require('path');
// const ejs = require('ejs')
const chalk = require('chalk');
const md5 = require('md5');
const { Compilation } = require('webpack');

const { buildManifestFilename } = require('koot/defaults/before-build');
const { LOCALEID } = require('koot/defaults/defines-window');
const writeChunkmap = require('koot/utils/write-chunkmap');
// const getAppType = require('koot/utils/get-app-type');
const __ = require('koot/utils/translate');
const getDistPath = require('koot/utils/get-dist-path');
const getCwd = require('koot/utils/get-cwd');
const getChunkmap = require('koot/utils/get-chunkmap');
const getDirDistPublic = require('koot/libs/get-dir-dist-public');
const validateTemplate = require('koot/libs/validate-template');
const getSpaLocaleFileId = require('koot/libs/get-spa-locale-file-id');
const generateHtmlRedirectMetas = require('koot/i18n/generate-html-redirect-metas');

const compilationEmitAsset = require('../libs/compilation-emit-asset');

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
        this.appTypeUse = settings.appTypeUse;
    }

    apply(compiler) {
        const {
            localeId,
            inject,
            template,
            serviceWorkerPathname,
            locales,
            appTypeUse,
        } = this;

        const filename = `index${localeId ? `.${localeId}` : ''}.html`;

        // 失败原因
        const fail = false;

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
            compiler.hooks.thisCompilation.tap(
                'SpaTemplatePlugin',
                (compilation) => {
                    compilation.hooks.processAssets.tapAsync(
                        {
                            name: 'SpaTemplatePlugin',
                            stage:
                                Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
                        },
                        (compilationAssets, callback) => {
                            compilationEmitAsset(compilation, filename, '');
                            compilationEmitAsset(
                                compilation,
                                buildManifestFilename,
                                ''
                            );
                            callback();
                        }
                    );
                }
            );
        }

        // 吐出文件: manifest 和 index.html
        compiler.hooks.thisCompilation.tap(
            'KootSpaTemplatePlugin',
            (compilation) => {
                compilation.hooks.processAssets.tapAsync(
                    {
                        name: 'KootSpaTemplatePlugin',
                        stage:
                            /**
                             * Generate the html after minification and dev tooling is done
                             */
                            Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
                    },
                    async (compilationAssets, callback) => {
                        await tapEmitAssets(
                            {
                                localeId,
                                inject,
                                template,
                                serviceWorkerPathname,
                                locales,
                                appTypeUse,
                                filename,
                            },
                            fail,
                            compilation,
                            callback
                        );
                    }
                );
            }
        );

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

// ============================================================================

async function tapEmitAssets(options = {}, failReason, compilation, callback) {
    const {
        localeId,
        inject,
        template,
        serviceWorkerPathname,
        locales,
        appTypeUse,
        filename,
    } = options;

    const isI18nEnabled = Array.isArray(locales) && locales.length;

    // 获取并写入 chunkmap
    await writeChunkmap(
        compilation,
        localeId,
        undefined,
        serviceWorkerPathname,
        {
            allAssetsMap: false,
        }
    );

    const manifest = getChunkmap(localeId, false, true);
    const {
        '.files': filemap,
        '.entrypoints': entrypoints,
        // 'service-worker': serviceWorker
    } = manifest;

    // console.log({
    //     serviceWorker,
    //     KOOT_PWA_PATHNAME: process.env.KOOT_PWA_PATHNAME
    // });

    // 如果环境变量中未找到模板结果，报错并返回
    if (typeof process.env.KOOT_HTML_TEMPLATE !== 'string') {
        failReason = __('build.spa_template_not_found');
        return callback();
    }
    const templateStr =
        process.env.WEBPACK_BUILD_ENV === 'dev'
            ? await validateTemplate(template)
            : process.env.KOOT_HTML_TEMPLATE;

    const renderTemplate = (() => {
        switch (appTypeUse) {
            case 'ReactSPA': {
                return require(`koot/React/render-template`);
            }
            default: {
            }
        }
        return () => '';
    })();
    const defaultInject = (() => {
        switch (appTypeUse) {
            case 'ReactSPA': {
                const inject = require(`koot/ReactSPA/inject`)({
                    filemap,
                    compilation,
                    entrypoints,
                    manifest,
                    localeId,
                    localeFileMap: isI18nEnabled
                        ? locales.reduce((map, [localeId]) => {
                              map[localeId] =
                                  filemap[getSpaLocaleFileId(localeId) + '.js'];
                              return map;
                          }, {})
                        : undefined,
                    defaultLocaleId: isI18nEnabled ? locales[0][0] : undefined,
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

    const projectInject = await (async () => {
        if (!inject) return {};
        if (typeof inject !== 'string') return {};
        if (!fs.existsSync(inject)) return {};

        const content =
            `const ${LOCALEID} = '${localeId}';\n` +
            fs.readFileSync(inject, 'utf-8');

        // eslint-disable-next-line no-eval
        let thisModule = eval(content);

        if (typeof thisModule !== 'object') {
            const dir = path.dirname(inject);
            const file = path.resolve(dir, md5(content) + '.js');
            await fs.writeFile(file, content, 'utf-8');
            thisModule = require(file);
            console.log({ thisModule });
            await fs.unlink(file);
        }

        if (typeof thisModule.default === 'object') return thisModule.default;
        return thisModule || {};
    })();

    // console.log({ projectInject });

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

    compilationEmitAsset(compilation, filename, html);

    // 生产环境：写入文件
    if (process.env.WEBPACK_BUILD_ENV === 'prod') {
        const pathname = path.resolve(
            getDirDistPublic(getDistPath()),
            filename
        );
        await fs.ensureFile(pathname);
        await fs.writeFile(pathname, html, 'utf-8');
    }

    return callback();
}
