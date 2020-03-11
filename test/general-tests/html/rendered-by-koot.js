const fs = require('fs-extra');
const path = require('path');

// 测试：koot.js 版本信息
// <!-- rendered by using koot.js 0.10.0-alpha.4 -->
module.exports = async html => {
    const { version } = await fs.readJson(
        path.resolve(__dirname, '../../../packages/koot/package.json')
    );

    const regex = new RegExp(
        `\\<\\!-- rendered by using koot\\.js ${version.replace(
            /\./g,
            '\\.'
        )} --\\>`
    );

    if (!regex.test(html)) console.warn(version, regex);
    expect(regex.test(html)).toBe(true);
};
