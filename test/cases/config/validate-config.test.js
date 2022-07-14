const fs = require('fs-extra');
const path = require('path');

const {
    keyConfigIcons,
} = require('../../../packages/koot/defaults/before-build');
const validateConfig = require('../../../packages/koot/libs/validate-config');

const samplesDir = path.resolve(__dirname, 'samples');
const samples = fs
    .readdirSync(samplesDir)
    .filter((filename) => {
        const file = path.resolve(samplesDir, filename);
        const lstat = fs.lstatSync(file);
        return !lstat.isDirectory();
    })
    .filter((filename) => path.extname(filename) === '.js')
    .map((filename) => ({
        name: path.parse(filename).name,
        file: path.resolve(samplesDir, filename),
        filename,
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
        filename,
    } of samples) {
        test(`类型: ${name}`, async () => {
            const resultDir = path.resolve(samplesDir, name);
            await fs.ensureDir(resultDir);
            await fs.emptyDir(resultDir);

            const configJson = require(path.resolve(samplesDir, filename));

            let err;
            let kootConfig;
            try {
                kootConfig = await validateConfig(samplesDir, {
                    configFilename: filename,
                    tmpDir: resultDir,
                });
            } catch (e) {
                err = e;
            }

            expect(typeof err).toBe('undefined');

            expect(typeof kootConfig).toBe('object');
            // 如果没有设定 name，会有默认值
            if (typeof configJson.name !== 'string') {
                expect(typeof kootConfig.name).toBe('string');
                expect(kootConfig.name).toBe(
                    require(path.resolve(samplesDir, 'package.json')).name
                );
            }
            expect(typeof kootConfig.template).toBe('string');
            expect(typeof kootConfig.routes).toBe('string');
            expect(typeof kootConfig.store).toBe('string');
            expect(typeof kootConfig.type).toBe('string');
            expect(typeof kootConfig.dist).toBe('string');
            expect(typeof kootConfig.cookiesToStore !== 'undefined').toBe(true);
            expect(typeof kootConfig.i18n !== 'undefined').toBe(true);
            expect(typeof kootConfig.pwa).toBe('undefined');
            expect(
                ['boolean', 'object'].some(
                    (t) => typeof kootConfig.serviceWorker === t
                ) && !Array.isArray(kootConfig.serviceWorker)
            ).toBe(true);
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

            // 如果设定了图标
            if (typeof configJson.icon === 'string') {
                const file = path.resolve(samplesDir, configJson.icon);
                if (fs.existsSync(file)) {
                    expect(typeof kootConfig[keyConfigIcons]).toBe('object');
                    expect(typeof kootConfig[keyConfigIcons].original).toBe(
                        'string'
                    );
                    expect(
                        fs.existsSync(kootConfig[keyConfigIcons].original)
                    ).toBe(true);
                    expect(typeof kootConfig[keyConfigIcons].square).toBe(
                        'string'
                    );
                    expect(
                        fs.existsSync(kootConfig[keyConfigIcons].square)
                    ).toBe(true);
                    expect(
                        typeof kootConfig[keyConfigIcons].dominantColor
                    ).toBe('string');
                    expect(
                        /^#/.test(kootConfig[keyConfigIcons].dominantColor)
                    ).toBe(true);
                    if (
                        typeof configJson.webApp === 'undefined' ||
                        configJson.configJson === true
                    ) {
                        expect(typeof kootConfig.webApp).toBe('object');
                        expect(kootConfig.webApp.themeColor).toBe(
                            kootConfig[keyConfigIcons].dominantColor
                        );
                    }
                } else {
                    expect(typeof kootConfig[keyConfigIcons]).toBe('undefined');
                }
            }

            switch (kootConfig.type) {
                case 'react':
                case 'react-app': {
                    if (kootConfig.target === 'serverless')
                        expect(kootConfig.serverPackAll).toBe(true);
                    break;
                }
                case 'react-spa': {
                    expect(typeof kootConfig.target).not.toBe('serverless');
                    if (kootConfig.target === 'electron')
                        expect(typeof kootConfig.electron).toBe('object');
                    else expect(typeof kootConfig.electron).toBe('undefined');
                    break;
                }
                default: {
                }
            }
        });
    }
});
