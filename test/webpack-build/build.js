const fs = require('fs-extra')
const path = require('path')
const isValidPath = require('is-valid-path')

const createConfig = require('../../core/webpack/config/create')

const projects = require('../projects')
const stages = ['client', 'server']
const envs = ['prod', 'dev']

const kootBuild = require('../../core/webpack/enter')

const run = async () => {
    for (let project of projects) {
        const dir = path.resolve(__dirname, '../../node_modules', project)

        const fileProjectConfig = path.resolve(dir, 'koot.js')
        const fileBuildConfig = path.resolve(dir, 'koot.build.js')

        process.env.WEBPACK_BUILD_STAGE = 'client'
        process.env.WEBPACK_BUILD_ENV = 'prod'
        process.env.KOOT_CWD = dir
        process.env.KOOT_PROJECT_CONFIG_PATHNAME = fileProjectConfig
        process.env.KOOT_BUILD_CONFIG_PATHNAME = fileBuildConfig

        try {
            await kootBuild(require(fileBuildConfig))
            console.log('complete')
        } catch (err) {
            console.error(err)
        }
    }
}

run()
