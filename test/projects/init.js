/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');
const symlinkDir = require('symlink-dir');

const spinner = require('../../packages/koot/utils/spinner');
const getProjects = require('./get');

const internalPackages = ['koot', 'koot-webpack', 'koot-electron'];
const linkPackages = ['sharp'];

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
const initProject = async (name) => {
    const cwd = path.resolve(__dirname, name);
    const filePackagejson = path.resolve(cwd, 'package.json');
    const pkgKoot = await fs.readJson(
        path.resolve(__dirname, '../../packages/koot/package.json')
    );
    const pkgKootWebpack = await fs.readJson(
        path.resolve(__dirname, '../../packages/koot-webpack/package.json')
    );
    // const title = `测试项目 ${name}`
    const titleInTerminal = '测试项目 ' + chalk.yellow(name);

    const error = (err) => {
        spinner(titleInTerminal).fail();
        console.error(err);
    };

    // 更新 package.json
    {
        const pkg = await fs.readJson(filePackagejson);

        // koot -> 本地
        if (typeof pkg.dependencies !== 'object') pkg.dependencies = {};

        // 清空 devDependencies
        delete pkg.devDependencies;

        // 将 koot 的所有依赖替换入目标项目的 dev-dependencies
        pkg.devDependencies = {
            ...pkgKoot.dependencies,
            ...pkgKootWebpack.dependencies,
        };
        // for (const dep of Object.keys(pkg.devDependencies)) {
        //     pkg.devDependencies[dep] = `file:../../../node_modules/${dep}`;
        // }

        // 移除所有内部包依赖
        for (const internalPackage of internalPackages) {
            // if (typeof pkg.dependencies === 'object')
            //     delete pkg.dependencies[internalPackage];
            pkg.dependencies[
                internalPackage
            ] = `file:../../../packages/${internalPackage}`;
            delete pkg.devDependencies[internalPackage];
        }

        // 处理需要创建 link 的包
        for (const name of linkPackages) {
            ['dependencies', 'devDependencies', 'optionalDependencies'].some(
                (type) => {
                    if (typeof pkg[type] !== 'object') return false;
                    if (typeof pkg[type][name] === 'string') {
                        pkg[type][name] = `file:../../../node_modules/${name}`;
                        return true;
                    }
                    return false;
                }
            );

            const loc = path.resolve(cwd, 'node_modules', name);
            if (fs.existsSync(loc)) await fs.remove(loc);
        }

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
            spaces: 4,
        });
    }

    // 安装依赖
    {
        const waiting = spinner(`${titleInTerminal} - 安装中...`);
        const { /*stdout,*/ stderr } = await exec(
            'npm install --no-package-lock',
            // 'yarn install --no-lockfile',
            {
                cwd,
            }
        );
        waiting.stop();
        if (stderr) {
            if (!/^npm WARN/.test(stderr) || /^warning /.test(stderr)) {
                console.warn(stderr);
            } else {
                error(stderr);
            }
        } else {
        }
    }

    // symlink 内部包
    for (const name of [...internalPackages]) {
        const target = path.resolve(__dirname, '../../packages', name);
        const loc = path.resolve(cwd, 'node_modules', name);
        if (fs.existsSync(loc)) await fs.remove(loc);
        await symlinkDir(target, loc)
            .then(() => {
                console.log(`symlink ${loc} => ${target}`);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    // 标记成功
    spinner(titleInTerminal).succeed();
};
