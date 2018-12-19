const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

import __KOOT_GET_DIST_PATH__ from '../../../../utils/get-dist-path'

/** @type {String} ssr.js 文件内容 */
let __KOOT_SSR_FILE_CONTENT__

/**
 * 执行服务器端渲染 (Server-Side Rendering)
 */
const ssr = async ({
    ...__KOOT_SSR__
}) => new Promise(async resolve => {
    if (!__KOOT_SSR_FILE_CONTENT__) {
        const fileSSR = path.resolve(__KOOT_GET_DIST_PATH__(), 'server/ssr.js')
        if (fs.existsSync(fileSSR)) {
            __KOOT_SSR_FILE_CONTENT__ = fs.readFileSync(fileSSR, 'utf-8')
        } else {
            throw new Error('No `/server/ssr.js` found. Maybe there\'s an error while building. Please retry `koot-build`')
        }
    }

    // __KOOT_SSR__.result = ''
    // __KOOT_SSR__.styleMap = {}
    Object.assign(__KOOT_SSR__, {
        // setExtender: __KOOT_SET_EXTENDER__,
        // setPageinfo: __KOOT_SET_PAGEINFO__,
        // hocExtend: __KOOT_HOC_EXTENDER__,
        // hocPageinfo: __KOOT_HOC_PAGEINFO__
    })
    let Store, History

    console.log('\n' + chalk.cyanBright('eval SSR'))
    await eval(__KOOT_SSR_FILE_CONTENT__)

    const set = () => setTimeout(() => {
        if (!__KOOT_SSR__.__RESULT__)
            return set()
        // console.log(__KOOT_SSR__)
        console.log(chalk.cyanBright('eval SSR end') + '\n')
        resolve(__KOOT_SSR__.__RESULT__)
    }, 10)

    set()
})

export default ssr
