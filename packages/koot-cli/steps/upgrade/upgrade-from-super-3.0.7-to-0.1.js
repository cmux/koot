import fs from 'fs-extra';
import path from 'node:path';

import getAllFiles from '../../lib/get-all-files.js';
import spinner from '../../lib/spinner.js';
// import _ from '../../lib/translate.js'

import msgUpgrading from './msg-upgrading.js';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (dir = process.cwd()) => {
    const msg = msgUpgrading('super-project 3.0.7', 'koot 0.1.0');
    const waiting = spinner(msg + '...');
    const files = await getAllFiles(dir, {
        onlyASCII: true,
        ignoreLockFiles: true,
    });
    const filesChanged = [];
    const filesRemoved = [];
    const writeFile = true;

    for (const pathname of files) {
        // console.log(pathname)
        const filename = path.basename(pathname);
        const content = await fs.readFile(pathname, 'utf-8');
        let newPathname = pathname;
        let changed = content;

        // 文件更名
        const regexFilename = /([^a-zA-Z0-9_]*?)super\.([a-zA-Z]+?)/g;
        if (
            path.relative(dir, path.dirname(pathname)) === '' &&
            regexFilename.test(filename)
        ) {
            newPathname = path.resolve(
                path.dirname(pathname),
                filename.replace(regexFilename, '$1koot.$2')
            );
            if (writeFile) await fs.rename(pathname, newPathname);
        }

        // 替换文件内容
        const replace = async (regex, to) => {
            if (regex.test(changed)) {
                changed = changed.replace(regex, to);
                if (!filesChanged.includes(newPathname))
                    filesChanged.push(newPathname);
                if (writeFile)
                    await fs.writeFile(newPathname, changed, 'utf-8');
            }
        };

        await replace(
            /([^a-zA-Z0-9_]*?)WEBPACK_BUILD_CONFIG_PATHNAME([^a-zA-Z0-9_]*?)/g,
            '$1KOOT_BUILD_CONFIG_PATHNAME$2'
        );
        // await replace(
        //     /([^a-zA-Z0-9_]*?)super-project-(.+?)/g,
        //     '$1koot-$2'
        // )
        // await replace(
        //     /([^a-zA-Z0-9_]*?)super-project\/(.+?)/g,
        //     '$1koot/$2'
        // )
        await replace(
            /([^a-zA-Z0-9_]*?)super-project([^a-zA-Z0-9_]*?)/g,
            '$1koot$2'
        );
        await replace(
            /([^a-zA-Z0-9_]*?)superBuild([^a-zA-Z0-9_]*?)/g,
            '$1kootBuild$2'
        );
        await replace(/([^a-zA-Z0-9_]*?)SUPER_([a-zA-Z]+?)/g, '$1KOOT_$2');
        await replace(/([^a-zA-Z0-9_]*?)super-([a-zA-Z]+?)/g, '$1koot-$2');
        await replace(/([^a-zA-Z0-9_]*?)super\.([a-zA-Z]+?)/g, '$1koot.$2');
        // await replace(
        //     /([^a-zA-Z0-9_]*?)super\/([a-zA-Z]+?)/g,
        //     '$1koot/$2'
        // )

        // console.log(changed)
    }

    // 修改 package.json 的依赖项
    const pathnamePackagejson = path.resolve(dir, 'package.json');
    const p = await fs.readJson(pathnamePackagejson);
    delete p.dependencies['super-project'];
    p.dependencies.koot = '^0.1.0';
    if (writeFile)
        await fs.writeJson(pathnamePackagejson, p, {
            spaces: 4,
        });
    if (!filesChanged.includes(pathnamePackagejson))
        filesChanged.push(pathnamePackagejson);

    // 删除 package-lock.json
    if (writeFile) {
        const pathnamePackageLock = path.resolve(dir, 'package-lock.json');
        if (fs.existsSync(pathnamePackageLock)) {
            await fs.remove(pathnamePackageLock);
            filesRemoved.push(pathnamePackageLock);
        }
    }

    waiting.stop();
    spinner(msg).finish();

    // console.log(filesChanged)

    return {
        files: filesChanged,
        removed: filesRemoved,
    };
};
