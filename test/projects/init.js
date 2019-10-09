/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');

const spinner = require('../../packages/koot/utils/spinner');
const getProjects = require('./get');

const kootDirRelative = '../../packages/koot';
const kootWebpackDirRelative = '../../packages/koot-webpack';

/**
 * 初始化所有测试项目
 * @async
 */
module.exports = async () => {
    console.log(chalk.cyanBright('准备测试项目代码库...'));

    for (const { name } of getProjects()) {
        await initProject(name);
    }
};

/**
 * 初始化一个项目
 * @async
 * @param {String} name 项目名
 */
const initProject = async name => {
    const cwd = path.resolve(__dirname, name);
    const filePackagejson = path.resolve(cwd, 'package.json');
    const pkgKoot = await fs.readJson(
        path.resolve(__dirname, kootDirRelative, 'package.json')
    );
    const pkgKootWebpack = await fs.readJson(
        path.resolve(__dirname, kootWebpackDirRelative, 'package.json')
    );
    // const title = `测试项目 ${name}`
    const titleInTerminal = '测试项目 ' + chalk.yellow(name);

    const error = err => {
        spinner(titleInTerminal).fail();
        console.error(err);
    };

    // 更新 package.json
    {
        const pkg = await fs.readJson(filePackagejson);

        // koot -> 本地
        if (typeof pkg.dependencies !== 'object') pkg.dependencies = {};
        pkg.dependencies.koot = `file:../${kootDirRelative}`;
        pkg.dependencies['koot-webpack'] = `file:../${kootWebpackDirRelative}`;

        // 清空 devDependencies
        delete pkg.devDependencies;

        // 将 koot 的所有依赖替换入目标项目的 dev-dependencies
        pkg.devDependencies = {
            ...pkgKoot.dependencies,
            ...pkgKootWebpack.dependencies
        };
        delete pkg.devDependencies.koot;
        delete pkg.devDependencies['koot-webpack'];

        // 将所有 devDependencies 指向到项目根层的 node_modules
        // for (const name of Object.keys(pkg.devDependencies)) {
        //     if (
        //         fs.existsSync(
        //             path.resolve(__dirname, '../../node_modules', name)
        //         )
        //     ) {
        //         pkg.devDependencies[
        //             name
        //         ] = `file:../../../node_modules/${name}`;
        //     }
        // }

        // 添加命令
        const commands = [
            // ['isomorphic-build', 'koot-build --env prod --koot-test'],
            // ['isomorphic-start-server', 'koot-start --no-build'],
            // ['isomorphic-start-server-custom-port', 'koot-start --no-build --port 8316'],
            // ['isomorphic-dev', 'koot-dev --no-open'],
        ];
        commands.forEach(([name, cmd]) => {
            pkg.scripts[`koot-buildtest-${name}`] = cmd;
        });

        // 添加其他标记
        pkg.private = true;
        pkg.sideEffects = false;

        // 写入文件
        await fs.writeJson(filePackagejson, pkg, {
            spaces: 4
        });
    }

    // 安装依赖
    {
        const waiting = spinner(`${titleInTerminal} - 安装中...`);
        const { /*stdout,*/ stderr } = await exec(
            // 'npm install --no-package-lock',
            'yarn install --no-lockfile',
            {
                cwd
            }
        );
        waiting.stop();
        if (stderr) {
            if (!/^npm WARN/.test(stderr)) return error(stderr);
        } else {
        }
    }

    // symlink node_modules -> 根层
    // {
    //     // await fs.remove(path.resolve(cwd, 'node_modules'));
    //     await fs
    //         .ensureLink(
    //             path.resolve(__dirname, '../../node_modules'),
    //             path.resolve(cwd, 'node_modules')
    //         )
    //         .catch(err => {
    //             console.error(err);
    //         });
    // }

    // 标记成功
    spinner(titleInTerminal).succeed();
};
