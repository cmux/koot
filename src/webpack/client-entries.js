const path = require('path')
const config = require('../config/webpack')

module.exports = (appPath, type) => {
    switch (type) {
        /*case 'portals':
            return {
                critical: [
                    path.resolve(appPath, './src/server/app-plus/views/src/critical')
                ],
                client: [
                    path.resolve(appPath, './src/server/app-plus/views/src/client')
                ]
            }*/

        default: {
            let entryFiles = {}
            entryFiles[config.APP_1_ENTER_JS_NAME] = [path.resolve(appPath, './src/apps/react/client')]
            return entryFiles
        }

        // return {
        //     /*"critical-extra-old-ie": [
        //         "babel-polyfill",
        //         path.resolve(appPath, './src/client/critical.extra-old-ie.js')
        //     ],
        //     critical: [
        //         path.resolve(appPath, './src/client/critical')
        //     ],*/
        //     "react-client": [
        //         path.resolve(appPath, './src/apps/react/client')
        //     ]
        // }


    }
}