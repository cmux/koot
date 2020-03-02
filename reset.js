// reset all `node_modules` folders

const fs = require('fs-extra');
const path = require('path');

const toRemove = [path.resolve(__dirname, './node_modules')];

(async () => {
    const dirProjects = path.resolve(__dirname, './test/projects');

    fs.readdirSync(dirProjects)
        .map(filename => path.resolve(dirProjects, filename))
        .filter(file => {
            const lstat = fs.lstatSync(file);
            return lstat.isDirectory();
        })
        .forEach(file => {
            toRemove.push(path.resolve(file, 'node_modules'));
        });

    for (const dir of toRemove) {
        await fs.remove(dir);
    }
})();
