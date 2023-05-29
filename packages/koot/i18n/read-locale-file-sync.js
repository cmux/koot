/* eslint-disable no-eval */
// const fs = require('fs-extra');
import fs from 'node:fs';
import path from 'node:path';

import getCwd from '../utils/get-cwd.js';

const readLocaleFileSync = (pathname) => {
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
        ? // ? fs.readJsonSync(file)
          JSON.parse(fs.readFileSync(file, 'utf-8'))
        : eval(`require("${file.replace(/\\/g, '\\\\')}")`);
};

export default readLocaleFileSync;
