const fs = require('fs-extra');
const path = require('path');

/**
 * 向 package.json 里添加 npm 命令
 * @async
 * @param {String} name
 * @param {String} command
 * @param {String} cwd
 */
const addCommand = async (name, command, cwd) => {
    const pathPackage = path.resolve(cwd, 'package.json');
    const p = await fs.readJson(pathPackage);
    // if (!p.scripts[name])
    p.scripts[name] = command;
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    });
};

module.exports = addCommand;
