import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import parseIgnore from 'gitignore-globs';
import isBinaryFile from 'isbinaryfile';

const lockFiles = ['package-lock.json', 'yarn.lock'];

/**
 * 获取项目目录中所有文件（忽略 .gitignore 中的文件）
 * @param {String} dir
 * @param {Object} options
 * @param {Boolean} [options.onlyASCII=false] 仅返回 ASCII 文件
 * @param {Array} [options.ignore] 忽略的文件列表
 * @param {Boolean} [options.ignoreLockFiles] 忽略 lock 文件，如 package-lock.json、yarn.lock
 * @returns {Array} 文件路径名列表
 */
const getAllFiles = async (dir = process.cwd(), options = {}) => {
    const { onlyASCII = false, ignore = [], ignoreLockFiles = false } = options;
    const ignores = (await getIgnores(dir))
        .concat(ignore)
        .concat(ignoreLockFiles ? lockFiles : []);

    // console.log(ignores)

    return (
        await glob('**/*', {
            cwd: dir,
            dot: true,
            ignore: ignores,
        })
    )
        .map((filename) => path.resolve(dir, filename))
        .filter((pathname) => {
            const stat = fs.lstatSync(pathname);

            if (stat.isDirectory()) return false;

            if (onlyASCII && isBinaryFile.sync(pathname)) return false;

            return true;
        });
};

const getIgnores = async (dir = process.cwd()) => {
    const pathnameIgnore = path.resolve(dir, '.gitignore');

    if (!fs.existsSync(pathnameIgnore)) return [];

    const add = [];

    // const contentIgnore = await fs.readFile(path.resolve(dir, '.gitignore'))
    return parseIgnore(pathnameIgnore)
        .map((pattern) => {
            if (pattern.substr(0, 1) === '/') {
                if (
                    pattern.substr(pattern.length - 2, 2) === '**' &&
                    pattern.substr(pattern.length - 3, 1) !== '/'
                ) {
                    add.push(`${pattern.substr(1, pattern.length - 2)}/**`);
                }
                return pattern.substr(1);
            }
            return pattern;
        })
        .concat(add);
};

export default getAllFiles;
