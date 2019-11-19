const fs = require('fs-extra');
const path = require('path');

const validateConfig = require('../../../packages/koot/libs/validate-config');

const samplesDir = path.resolve(__dirname, 'samples');
const samples = fs
    .readdirSync(samplesDir)
    .filter(filename => {
        const file = path.resolve(samplesDir, filename);
        const lstat = fs.lstatSync(file);
        return !lstat.isDirectory();
    })
    .map(filename => ({
        name: path.parse(filename).name,
        file: path.resolve(samplesDir, filename),
        filename
    }));

// ============================================================================

/*
const debug = require('debug');

const run = async () => {
    for (const sample of samples) {
        await validateSample(sample);
    }
};
const validateSample = async sample => {
    // console.log('')

    // 重置环境变量
    delete process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME;
    delete process.env.KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME;
    delete process.env.KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME;

    const { name, file, filename } = sample;

    const log = debug(name);
    debug.enable(name);
    log('');

    // if (name !== 'full-0.7')
    //     return log('not 0.7. exit')

    const resultDir = path.resolve(samplesDir, name);
    await fs.ensureDir(resultDir);
    await fs.emptyDir(resultDir);

    const kootConfig = await validateConfig(samplesDir, {
        configFilename: filename,
        tmpDir: resultDir
    });

    // log(kootConfig)

    // await fs.remove(resultDir)
};
*/
// run()

// ============================================================================

// return

describe('测试: 验证配置 (生成临时的核心代码引用文件，返回其他配置对象)', () => {
    for (const {
        name,
        // file,
        filename
    } of samples) {
        test(`类型: ${name}`, async () => {
            const resultDir = path.resolve(samplesDir, name);
            await fs.ensureDir(resultDir);
            await fs.emptyDir(resultDir);

            let err;
            let kootConfig;
            try {
                kootConfig = await validateConfig(samplesDir, {
                    configFilename: filename,
                    tmpDir: resultDir
                });
            } catch (e) {
                err = e;
            }

            expect(typeof err).toBe('undefined');

            expect(typeof kootConfig).toBe('object');
            expect(typeof kootConfig.template).toBe('string');
            expect(typeof kootConfig.routes).toBe('string');
            expect(typeof kootConfig.store).toBe('string');
            expect(typeof kootConfig.type).toBe('string');
            expect(typeof kootConfig.dist).toBe('string');
            expect(typeof kootConfig.cookiesToStore !== 'undefined').toBe(true);
            expect(typeof kootConfig.i18n !== 'undefined').toBe(true);
            expect(typeof kootConfig.serviceWorker !== 'undefined').toBe(true);
            expect(
                typeof kootConfig.aliases === 'object' &&
                    !Array.isArray(kootConfig.aliases)
            ).toBe(true);
            expect(
                typeof kootConfig.defines === 'object' &&
                    !Array.isArray(kootConfig.defines)
            ).toBe(true);
            expect(typeof kootConfig.port).toBe('number');
            expect(kootConfig.moduleCssFilenameTest).toBeInstanceOf(RegExp);
            expect(typeof kootConfig.devPort).toBe('number');
            expect(typeof kootConfig.webpackConfig).toBe('function');
        });
    }
});
