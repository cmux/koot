// reset all `node_modules` folders

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const toRemove = [path.resolve(__dirname, './node_modules')];

(async () => {
    const dirProjects = path.resolve(__dirname, './test/projects');

    fs.readdirSync(dirProjects)
        .map((filename) => path.resolve(dirProjects, filename))
        .filter((file) => {
            const lstat = fs.lstatSync(file);
            return lstat.isDirectory();
        })
        .forEach((file) => {
            toRemove.push(path.resolve(file, 'node_modules'));
        });

    for (const dir of toRemove) {
        await fs.remove(dir);
    }
})();
