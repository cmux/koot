import path from 'node:path';
import url from 'node:url';

import fs from 'fs-extra';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * 获取所有测试项目
 * @async
 * @returns {Object[]}
 */
// eslint-disable-next-line import/no-anonymous-default-export
export default () =>
    fs
        .readdirSync(__dirname)
        .filter((filename) => {
            const pathname = path.resolve(__dirname, filename);
            const stat = fs.lstatSync(pathname);

            if (!stat.isDirectory()) return false;

            const filePackagejson = path.resolve(pathname, 'package.json');

            if (!fs.existsSync(filePackagejson)) return false;

            return true;
        })
        .map((filename) => ({
            name: filename,
            dir: path.resolve(__dirname, filename),
            // type: [
            //     'react-isomorphic',
            //     'react-spa'
            // ]
        }));
