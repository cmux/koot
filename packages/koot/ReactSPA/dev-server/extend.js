const fs = require('fs-extra')

const { dll } = require('../../defaults/dev-request-uri')

/**
 * 扩展 webpack-dev-server
 * @param {Object} server
 */
module.exports = (app) => {
    // console.log(server)
    // return
    const { KOOT_DEV_DLL_FILE_CLIENT: fileDll } = process.env
    if (fileDll && fs.existsSync(fileDll))
        app.get(`${dll}`, function (req, res) {
            res.type('application/javascript')
            res.send(fs.readFileSync(fileDll))
        })
}
