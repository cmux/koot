const fs = require('fs-extra')
const path = require('path')
const getFilePath = require('./get-client-file-path')

module.exports = filename => {
    // console.log(
    //     process.cwd(),
    //     ' | ',
    //     getFilePath(filename)
    // )
    // console.log(' ')
    // console.log(global.__SUPER_DIST__ || __DIST__)
    // console.log(getFilePath(filename))
    // console.log(path.resolve(
    //     global.__SUPER_DIST__ || __DIST__,
    //     getFilePath(filename)
    // ))
    // console.log(' ')
    return fs.readFileSync(
        path.resolve(
            global.__SUPER_DIST__ || __DIST__,
            'public/',
            getFilePath(filename).replace(/^\//, '')
        ),
        'utf-8'
    )
}