const path = require('path');

const getIgnores = (clientRoot) => {
    return [path.resolve(clientRoot, '.electron/**/*')];
};

module.exports = {
    getIgnores,
};
