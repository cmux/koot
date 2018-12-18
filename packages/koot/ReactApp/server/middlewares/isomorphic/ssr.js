const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

import { default as __KOOT_GET_DIST_PATH__ } from '../../../../utils/get-dist-path'

/** @type {String} ssr.js 文件内容 */
let __KOOT_SSR_FILE_CONTENT__

/**
 * 执行服务器端渲染 (Server-Side Rendering)
 */
const ssr = ({
    Store, History, renderProps: __KOOT_SSR_ROOT_RENDER_PROPS__
}) => {
    if (!__KOOT_SSR_FILE_CONTENT__) {
        const fileSSR = path.resolve(__KOOT_GET_DIST_PATH__(), 'server/ssr.js')
        if (fs.existsSync(fileSSR)) {
            __KOOT_SSR_FILE_CONTENT__ = fs.readFileSync(fileSSR, 'utf-8')
        } else {
            throw new Error('No `/server/ssr.js` found. Maybe there\'s an error while building. Please retry `koot-build`')
        }
    }

    const __KOOT_SSR__ = {
        result: '',
        styleMap: {}
    }

    console.log('\n')
    console.log(chalk.cyanBright('SSR'))
    eval(__KOOT_SSR_FILE_CONTENT__)
    console.log('\n')
    console.log(__KOOT_SSR__)

    return __KOOT_SSR__.result
}

export default ssr
