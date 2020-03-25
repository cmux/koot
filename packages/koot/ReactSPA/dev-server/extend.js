const fs = require('fs-extra');

const { dll } = require('../../defaults/dev-request-uri');
const getDevRoutes = require('../../libs/get-dev-routes');

/**
 * 扩展 webpack-dev-server
 * @param {Object} server
 */
module.exports = app => {
    getDevRoutes().forEach(({ file, route }) => {
        app.get(`${route}`, function(req, res) {
            res.type('application/javascript');
            res.send(fs.readFileSync(file));
        });
    });
    // console.log({files})
    // console.log(server)
    // return
    const { KOOT_DEV_DLL_FILE_CLIENT: fileDll } = process.env;
    if (fileDll && fs.existsSync(fileDll))
        app.get(`${dll}`, function(req, res) {
            res.type('application/javascript');
            res.send(fs.readFileSync(fileDll));
        });
};
