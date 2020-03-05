const fs = require('fs-extra');
const path = require('path');
const checkForChunkmap = require('../../libs/check-for-chunkmap');

/**
 * 测试：chunkmap
 * - 检查文件是否在硬盘对应路径
 * - 生产环境: 检查是否有 `libs.js` 和 `libs-others.js`
 * @async
 * @void
 * @param {String} dist
 */
module.exports = async (dist, isDev = true) => {
    const check = async chunkmap => {
        const filesToCheck = [];
        const filenames = [];
        const addFile = (filename, pathname) => {
            // if (/^public\//.test(file)) file = file.replace(/^public\//, '');
            if (!filesToCheck.includes(pathname)) filesToCheck.push(pathname);
            if (!filenames.includes(filename)) filenames.push(filename);
        };
        const addFiles = (obj = chunkmap) => {
            if (typeof obj !== 'object') return;
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    addFiles(value);
                } else if (typeof value === 'string') {
                    addFile(key, value);
                }
            });
        };
        addFiles();

        // console.log({ dist, chunkmap, filesToCheck });

        for (const file of filesToCheck) {
            let f = path.resolve(dist, file);
            if (!fs.existsSync(f) && /^public\//.test(file)) {
                f = path.resolve(dist, file.replace(/^public\//, ''));
            }
            const exist = fs.existsSync(f);
            if (!exist) {
                console.warn({
                    filesToCheck,
                    dist,
                    file,
                    pathname: f,
                    pathnameBeforeChange: path.resolve(dist, file)
                });
            }
            expect(exist).toBe(true);
        }

        // 生产环境
        if (!isDev) {
            // 检查是否有 `libs.js` 和 `libs-others.js`
            expect(filenames.includes('libs.js')).toBe(true);
            expect(filenames.includes('libs-others.js')).toBe(true);
        }
    };
    await checkForChunkmap(dist, check);
};
