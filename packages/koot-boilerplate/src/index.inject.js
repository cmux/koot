/* global
    __SVG_ICON_PACK__:false
*/

export default {
    performanceInfos: () => `<!-- rendered: ${(new Date()).toISOString()} -->`,
    svgIconPack: () => {
        if (__SPA__) {
            const fs = require('fs-extra')
            const path = require('path')
            return fs.readFileSync(path.resolve(__dirname, './assets/symbol-defs.svg'), 'utf-8')
        }
        return __SVG_ICON_PACK__
    }
}
