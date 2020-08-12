const path = require('path');
const { packedFilesFolderName } = require('./constants');

const getIgnores = (clientRoot) => {
    return [
        path.resolve(clientRoot, `${packedFilesFolderName}/**/*`),
        path.resolve(clientRoot, `main.js`),
        path.resolve(clientRoot, `package.json`),
    ];
};

module.exports = {
    getIgnores,
};
