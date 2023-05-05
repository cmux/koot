import fs from 'fs-extra';
import url from 'node:url';

// 测试：koot.js 版本信息
// <!-- rendered by using koot.js 0.10.0-alpha.4 -->
const renderedByKoot = async (html) => {
    const { version } = await fs.readJson(
        url.fileURLToPath(
            new URL('../../../packages/koot/package.json', import.meta.url)
        )
    );
    const checkStr = `<!-- rendered by using koot.js ${version} -->`;
    const result = html.includes(checkStr);

    // const regex = new RegExp(
    //     `\\<\\!-- rendered by using koot\\.js ${version.replace(
    //         /\./g,
    //         '\\.'
    //     )} --\\>`
    // );

    if (!result) console.warn({ version, checkStr, html });
    expect(result).toBe(true);
};

export default renderedByKoot;
