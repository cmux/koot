import path from 'node:path';

import getDirDevTmp from '../libs/get-dir-dev-tmp.js';

const getPathnameDevServerStart = (cwd) =>
    path.resolve(getDirDevTmp(cwd), '.server-start');

export default getPathnameDevServerStart;
