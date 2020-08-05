const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const md5 = require('md5');

const { keyConfigIcons } = require('../../defaults/before-build');

const safeguard = require('../../libs/safeguard');
const getTmp = require('../../libs/get-dir-dev-tmp');
const getCwd = require('../../utils/get-cwd');

/**
 * 针对所有命令：在正式开始打包之前
 * @param {Object} appConfig
 */
module.exports = async (appConfig) => {
    await safeguard(appConfig);
    await validateIconAndGenerateFiles(appConfig);
};

// ============================================================================

const validateIconAndGenerateFiles = async (appConfig) => {
    const { icon } = appConfig;
    const icons = {
        // original: '',
        // 'x180': '',
        // 'x192': '',
        // 'x512': '',
    };
    const cwd = getCwd();
    const folder = getTmp(undefined, 'icons');

    const resizeAndSave = async (file, size) => {
        const buffer = await sharp(await fs.readFile(file))
            .resize(size, size)
            .toBuffer();
        const filename = md5(buffer) + path.extname(file);
        const target = path.resolve(folder, filename);
        await fs.writeFile(target, buffer);
        icons[`x${size}`] = target;
    };

    await fs.ensureDir(folder);
    await fs.emptyDir(folder);

    if (typeof icon === 'string') {
        const file = path.resolve(cwd, icon);
        if (!fs.existsSync(file)) return appConfig;
        await Promise.all([
            await resizeAndSave(file, 180),
            await resizeAndSave(file, 192),
            await resizeAndSave(file, 512),
        ]);
        {
            const filename = md5(await fs.readFile(file)) + path.extname(file);
            const target = path.resolve(folder, filename);
            await fs.copy(file, target);
            icons.original = target;
        }
    } else if (typeof icon === 'object') {
    } else {
        return appConfig;
    }

    appConfig[keyConfigIcons] = icons;

    return appConfig;
};
