const path = require('path')
const isValidPath = require('is-valid-path')

const createConfig = require('../../core/webpack/config/create')

// const prepareProjects = require('../prepare-projects')
const { dir: dirProjects, projects } = require('../projects')
const stages = ['client', 'server']
const envs = ['prod', 'dev']

// beforeAll(async (done) => {
//     await prepareProjects()
//     done()
// })

describe('测试: 生成 Webpack 配置', async () => {

    // const dirProjects = path.resolve(__dirname, '../projects')
    // const projects = fs.readdirSync(dirProjects)
    //     .filter(filename => {
    //         const stat = fs.lstatSync(path.resolve(dirProjects, filename))
    //         return stat.isDirectory()
    //     })

    for (let project of projects) {
        for (let stage of stages) {
            for (let env of envs) {
                test(`${project} [${stage} | ${env}] 配置可用`, async () => {
                    const dir = path.resolve(dirProjects, project.name)

                    const fileProjectConfig = path.resolve(dir, 'koot.js')
                    const fileBuildConfig = path.resolve(dir, 'koot.build.js')

                    process.env.WEBPACK_BUILD_STAGE = stage
                    process.env.WEBPACK_BUILD_ENV = env
                    process.env.KOOT_CWD = dir
                    process.env.KOOT_PROJECT_CONFIG_PATHNAME = fileProjectConfig
                    process.env.KOOT_BUILD_CONFIG_PATHNAME = fileBuildConfig

                    const config = await createConfig(require(fileBuildConfig))

                    const modeToBe = stage === 'server' || env === 'dev' ? 'development' : 'production'

                    // console.log(stage, env, config)
                    expect(typeof config).toBe('object')

                    const {
                        dist,
                        aliases,
                        beforeBuild, afterBuild,
                        i18n = false,
                        webpackConfig,
                    } = config

                    expect(isValidPath(dist)).toBe(true)
                    expect(typeof aliases).toBe('object')
                    expect(typeof beforeBuild).toBe('function')
                    expect(typeof afterBuild).toBe('function')

                    if (stage === 'client' && typeof i18n === 'object' && i18n.type === 'default' && Array.isArray(i18n.locales) && i18n.locales.length > 1) {
                        expect(Array.isArray(webpackConfig)).toBe(true)
                        for (let thisConfig of webpackConfig) {
                            expect(typeof thisConfig).toBe('object')
                            const {
                                mode,
                                entry,
                                output,
                                plugins,
                                module,
                            } = thisConfig
                            expect(mode).toBe(modeToBe)
                            expect(typeof output).toBe('object')
                            expect(typeof output.path).toBe('string')
                            if (typeof entry === 'object') {
                                expect(('client' in entry)).toBe(true)
                                expect(typeof entry.client).toBe('string')
                            }
                            expect(Array.isArray(plugins)).toBe(true)
                            expect(plugins.some(p => p === null)).toBe(false)
                            expect(plugins.some(p => typeof p === 'undefined')).toBe(false)
                            expect(Array.isArray(module.rules)).toBe(true)
                        }
                    } else {
                        expect(typeof webpackConfig).toBe('object')
                        const {
                            mode,
                            entry,
                            output,
                            plugins,
                            module,
                        } = webpackConfig
                        // console.log(plugins)
                        expect(mode).toBe(modeToBe)
                        expect(typeof output).toBe('object')
                        expect(typeof output.path).toBe('string')
                        if (stage === 'client' && typeof entry === 'object') {
                            expect(('client' in entry)).toBe(true)
                            expect(typeof entry.client).toBe('string')
                        } else if (stage === 'server') {
                            expect(Array.isArray(entry)).toBe(true)
                        }
                        expect(Array.isArray(plugins)).toBe(true)
                        expect(plugins.some(p => p === null)).toBe(false)
                        expect(plugins.some(p => typeof p === 'undefined')).toBe(false)
                        expect(Array.isArray(module.rules)).toBe(true)
                    }
                })
            }
        }
    }
})
