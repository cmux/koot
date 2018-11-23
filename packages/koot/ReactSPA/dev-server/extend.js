const fs = require('fs-extra')
const path = require('path')

const { dll } = require('../../defaults/dev-request-uri')
const { filenameDll } = require('../../defaults/before-build')

/**
 * 扩展 webpack-dev-server
 * @param {Object} server
 */
module.exports = (app) => {
    // console.log(server)
    // return
    const file = path.resolve(process.env.KOOT_DIST_DIR, filenameDll)
    app.get(`${dll}`, function (req, res) {
        res.type('application/javascript')
        res.send(fs.readFileSync(file))
    })
}
