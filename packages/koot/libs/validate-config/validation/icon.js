import fs from 'fs-extra';
import path from 'node:path';
import sharp from 'sharp';
import md5 from 'md5';

import { keyConfigIcons } from '../../../defaults/before-build.js';
import getTmp from '../../../libs/get-dir-dev-tmp.js';
import getCwd from '../../../utils/get-cwd.js';
import rgbToHex from '../../../utils/rgb-to-hex.js';

// ============================================================================

/**
 * 分析、标准化选项: `icon`
 *
 * @param {Object} appConfig
 * @param {string} [outputDir] 相关资源输出目录，默认为临时目录
 */
const validateConfigIcon = async (appConfig, outputDir) => {
    const { icon } = appConfig;
    const icons = {
        // original: '',
        // square: '',
        // 'x180': '',
        // 'x192': '',
        // 'x512': '',
        // dominantColor: '',
    };
    const cwd = getCwd();
    const folder = outputDir || getTmp(undefined, 'icons');

    // const resizeAndSave = async (file, size) => {
    //     const buffer = await sharp(await fs.readFile(file))
    //         .resize(size, size)
    //         .toBuffer();
    //     const filename = md5(buffer) + path.extname(file);
    //     const target = path.resolve(folder, filename);
    //     await fs.writeFile(target, buffer);
    //     icons[`x${size}`] = target;
    // };

    await fs.ensureDir(folder);
    await fs.emptyDir(folder);

    try {
        if (typeof icon === 'string') {
            const file = path.isAbsolute(icon) ? icon : path.resolve(cwd, icon);
            if (!fs.existsSync(file)) return appConfig;

            // console.log('1', sharp)

            const image = await sharp(await fs.readFile(file));
            const { width, height } = await image.metadata();
            const { dominant } = await image.stats();

            // await Promise.all([
            //     await resizeAndSave(file, 180),
            //     await resizeAndSave(file, 192),
            //     await resizeAndSave(file, 512),
            // ]);

            icons.dominantColor = rgbToHex(dominant.r, dominant.g, dominant.b);

            // 添加源文件
            {
                const filename =
                    md5(await fs.readFile(file)) + path.extname(file);
                const target = path.resolve(folder, filename);
                await fs.copy(file, target);
                icons.original = target;
            }

            // 添加方形
            {
                const buffer = await image
                    .resize(Math.min(width, height), Math.min(width, height))
                    .toBuffer();
                const filename = md5(buffer) + path.extname(file);
                const target = path.resolve(folder, filename);
                await fs.writeFile(target, buffer);
                icons.square = target;
            }
        } else if (typeof icon === 'object') {
        } else {
            return appConfig;
        }

        appConfig[keyConfigIcons] = icons;

        return appConfig;
    } catch (err) {
        console.warn(err.message);
        return appConfig;
    }
};

export default validateConfigIcon;
