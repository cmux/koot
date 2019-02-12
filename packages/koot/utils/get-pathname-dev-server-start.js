const path = require('path')
const getDirDevTmp = require('../libs/get-dir-dev-tmp')

module.exports = (cwd) => path.resolve(getDirDevTmp(cwd), '.server-start')
