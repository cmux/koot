const path = require('path');
const getDirDev = require('./get-dir-dev-tmp');

module.exports = {
    devBuildingServer: () => path.resolve(getDirDev(), '.building-server'),
};
