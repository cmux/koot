const fs = require('fs-extra')
const path = require('path')

import getDistPath from '../../../../utils/get-dist-path'

/** @type {String} ssr.js 文件内容 */
let SSR

/**
 * 执行服务器端渲染 (Server-Side Rendering)
 */
const ssr = ({
    Store, History, renderProps: __KOOT_SSR_ROOT_RENDER_PROPS__
}) => {
    if (!SSR) {
        const fileSSR = path.resolve(getDistPath(), 'server/ssr.js')
        if (fs.existsSync(fileSSR)) {
            SSR = fs.readFileSync(fileSSR, 'utf-8')
        } else {
            throw new Error('No `/server/ssr.js` found. Maybe there\'s an error while building. Please retry `koot-build`')
        }
    }
    const __KOOT_SSR__ = {
        result: ''
    }
    eval(SSR)
    return __KOOT_SSR__.result
}

export default ssr
