const fs = require('fs-extra')
const path = require('path')
const getFilePath = require('./get-client-file-path')

module.exports = (filename, localeId) => {
    // console.log(
    //     process.cwd(),
    //     ' | ',
    //     getFilePath(filename)
    // )
    // console.log(' ')
    // console.log(process.env.SUPER_DIST_DIR)
    // console.log(getFilePath(filename))
    // console.log(path.resolve(
    //     process.env.SUPER_DIST_DIR,
    //     getFilePath(filename)
    // ))
    // console.log(' ')
    return fs.readFileSync(
        path.resolve(
            // process.env.SUPER_DIST_DIR,
            path.resolve(process.cwd(), process.env.SUPER_DIST_DIR),
            'public/',
            getFilePath(filename, localeId).replace(/^\//, '')
        ),
        'utf-8'
    )
}
