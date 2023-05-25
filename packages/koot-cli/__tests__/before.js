import util from 'node:util';
import url from 'node:url';
import { exec as _exec } from 'node:child_process';

import ensureLocales from '../lib/ensure-locales.js';

const exec = util.promisify(_exec);

const before = async () => {
    await ensureLocales();
    // await exec('npm i', {
    //     cwd: url.fileURLToPath(new URL('../', import.meta.url)),
    // });
};

export default before;
