const fs = require('fs-extra');
const path = require('path');

const {
    buildManifestFilename,
    buildOutputsFilename
} = require('../../packages/koot/defaults/before-build');

/**
 * 测试: 检查打包结果根目录下的文件
 */
module.exports = async ({ dist, env, type, serverMode } = {}) => {
    if (!dist) throw new Error(`missing parameter: 'dist'`);
    if (!env) throw new Error(`missing parameter: 'env'`);
    if (!type) throw new Error(`missing parameter: 'type'`);

    if (env !== 'prod') return;

    const checkFile = (filename, toBe = true) => {
        const file = path.resolve(dist, filename);
        const result = fs.existsSync(file);
        if (result !== toBe) {
            throw new Error(
                `"${filename}" | ${file} | ${
                    result ? 'exist' : 'not exist'
                } | toBe ${toBe}`
            );
        }
        expect(result).toBe(toBe);
    };

    checkFile('.eslintignore');
    checkFile('.gitignore');
    checkFile('.prettierignore');
    checkFile(buildManifestFilename);
    checkFile(buildOutputsFilename);

    if (type === 'isomorphic') {
        checkFile('package.json');
        checkFile('index.js');
        if (serverMode === 'serverless') {
            checkFile('.dockerignore', false);
            checkFile('Dockerfile', false);
        } else {
            checkFile('.dockerignore');
            checkFile('Dockerfile');
        }
    } else {
        checkFile('package.json', false);
        checkFile('index.js', false);
        checkFile('.dockerignore', false);
        checkFile('Dockerfile', false);
    }
};
