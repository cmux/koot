const path = require('path');
// const { electronFilesFolderName } = require('./constants');

const getIgnores = (clientRoot) => {
    return [
        // path.resolve(clientRoot, `${electronFilesFolderName}/**/*`),
        path.resolve(clientRoot, `main.js`),
        path.resolve(clientRoot, `package.json`),
    ];
};

module.exports = {
    getIgnores,
};
