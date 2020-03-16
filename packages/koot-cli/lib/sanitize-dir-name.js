const sanitize = require('sanitize-filename');

module.exports = name =>
    sanitize(name, { replacement: '-' }).replace(/[ ]+/g, '-');
