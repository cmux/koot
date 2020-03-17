/* eslint-disable no-eval */
const fs = require('fs-extra');
const path = require('path');

const getCwd = require('../utils/get-cwd');

module.exports = pathname => {
    // if (process.env.WEBPACK_BUILD_STAGE === 'client') return {};

    const file = path.isAbsolute(pathname)
        ? pathname
        : path.resolve(getCwd(), pathname);
    // console.log({
    //     pathname,
    //     file,
    //     extname: path.extname(file),
    //     exists: fs.existsSync(file)
    // });
    return path.extname(file) === '.json'
        ? fs.readJsonSync(file)
        : eval(`require("${file.replace(/\\/g, '\\\\')}")`);
};
