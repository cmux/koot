const fs = require('fs-extra')
const path = require('path')

const baseConfig = require('./koot.config')

module.exports = Object.assign({}, baseConfig, {
    dist: './dist-no-bundles-kepp/',
    bundleVersionsKeep: false,
    webpackBefore: async (kootConfig) => {
        await baseConfig.webpackBefore(kootConfig)
        if (process.env.WEBPACK_BUILD_STAGE === 'client') {
            const dist = process.env.KOOT_DIST_DIR
            await fs.remove(path.resolve(dist, 'public'))
            await fs.remove(path.resolve(dist, 'server'))
        }
        return
    },
})
