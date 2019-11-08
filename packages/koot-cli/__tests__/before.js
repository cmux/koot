const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async () => {
    await exec('npm i', {
        cwd: path.resolve(__dirname, '../')
    });
};
