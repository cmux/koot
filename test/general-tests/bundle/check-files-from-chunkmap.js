const fs = require('fs-extra');
const path = require('path');
const checkForChunkmap = require('../../libs/check-for-chunkmap');

/**
 * 测试：根据 chunkmap，检查文件是否在硬盘对应路径
 * @async
 * @void
 * @param {String} dist
 */
module.exports = async dist => {
    const check = async chunkmap => {
        const filesToCheck = [];
        const addFile = file => {
            // if (/^public\//.test(file)) file = file.replace(/^public\//, '');
            if (filesToCheck.includes(file)) return;
            filesToCheck.push(file);
        };
        const addFiles = (obj = chunkmap) => {
            if (typeof obj !== 'object') return;
            Object.values(obj).forEach(value => {
                if (typeof value === 'object') {
                    addFiles(value);
                } else if (typeof value === 'string') {
                    addFile(value);
                }
            });
        };
        addFiles();

        // console.log(dist, filesToCheck);

        for (const file of filesToCheck) {
            let f = path.resolve(dist, file);
            if (!fs.existsSync(f) && /^public\//.test(file)) {
                f = path.resolve(dist, file.replace(/^public\//, ''));
            }
            expect(fs.existsSync(f)).toBe(true);
        }
    };
    await checkForChunkmap(dist, check);
};
