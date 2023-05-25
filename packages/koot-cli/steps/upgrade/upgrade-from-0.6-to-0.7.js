import chalk from 'chalk';

import spinner from '../../lib/spinner.js';
import _ from '../../lib/translate.js';
import readConfigFile from '../../lib/read-config-file.js';
import addConfigOption from '../../lib/add-config-option.js';

import msgUpgrading from './msg-upgrading.js';
import updateVersionInPackagejson from './update-version-in-packagejson.js';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (cwd = process.cwd(), lastVersion = '0.6.0') => {
    const p = await readConfigFile(cwd);
    if (typeof p.css === 'object') {
        return;
    }

    const msg = msgUpgrading(lastVersion, '0.7.0');
    const waiting = spinner(msg + '...');
    const filesChanged = ['package.json'];

    // 新增配置: css
    await addConfigOption(
        cwd,
        'css',
        `{
        fileBasename: {
            normal: /\\.g/,
            component: /^((?!\\.g\\.).)*/,
        },
        extract: [
            /critical\\.g\\.less$/,
        ]
    }`,
        [
            '@type {Object} CSS 打包相关设置',
            '@namespace',
            `@property {Object} fileBasename 文件名规则，不包含扩展名部分。规则会自动应用到 \`.less\` \`.sass\` 和 \`.scss\` 文件上`,
            '@property {RegExp} fileBasename.normal 标准 CSS 文件，在打包时不会被 koot 定制的 css-loader 处理',
            '@property {RegExp} fileBasename.component 组件 CSS 文件，在打包时会被 koot 定制的 css-loader 处理',
            '@property {Array} extract 这些文件在打包时会拆成独立文件',
        ]
    );

    await updateVersionInPackagejson(cwd, '0.7.0');

    waiting.stop();
    spinner(msg).finish();

    return {
        warn:
            chalk.yellowBright('koot 0.7.0') +
            chalk.reset(' ') +
            '\n' +
            _('upgrade_0.7.0_warning'),
        files: filesChanged,
    };
};
