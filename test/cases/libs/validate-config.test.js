import { jest } from '@jest/globals';

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';

import validateConfig from '../../../packages/koot/libs/validate-config/index.js';
import defaultConfig from '../../../packages/koot/defaults/koot-config.js';
import {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortionServer,
    keyFileProjectConfigTempPortionClient,
} from '../../../packages/koot/defaults/before-build.js';
import getDirDevTemp from '../../../packages/koot/libs/get-dir-dev-tmp.js';

jest.useFakeTimers();
jest.setTimeout(10 * 60 * 1000); // 10 min

// ============================================================================

const filesToClear = [];
const tempDir = url.fileURLToPath(
    new URL('../../../logs/test-temp', import.meta.url)
);

// ============================================================================

fs.removeSync(tempDir);

afterAll(() => {
    // 清理临时文件
    for (const file of filesToClear) {
        fs.removeSync(file);
    }
    fs.removeSync(tempDir);
});

const testOnTheFly = async (
    kootConfig = {},
    packageJson = {},
    targetTests = {}
) => {
    const requiredKootConfig = {
        template: './src/template.ejs',
        routes: './src/routes',
        webpackConfig: {},
    };
    const basePackageJson = {
        name: 'koot-test-validate-config',
        private: true,
    };

    const fileKootConfig = path.resolve(tempDir, 'koot.config.js');
    const filePackageJson = path.resolve(tempDir, 'package.json');

    await fs.ensureDir(tempDir);
    await fs.writeFile(
        fileKootConfig,
        `module.exports = ${JSON.stringify({
            ...requiredKootConfig,
            ...kootConfig,
        })}`,
        'utf-8'
    );
    await fs.writeJson(filePackageJson, {
        ...basePackageJson,
        ...packageJson,
    });

    const fullConfig = await validateConfig(tempDir);

    await fs.remove(tempDir);

    Object.keys(targetTests).forEach((key) => {
        expect(fullConfig[key]).toBe(targetTests[key]);
    });
};

describe(`测试: libs/validate-config`, () => {
    const fileKeysToCheck = [
        keyFileProjectConfigTempFull,
        keyFileProjectConfigTempPortionServer,
        keyFileProjectConfigTempPortionClient,
    ];

    test(`默认环境 (生产环境)`, async () => {
        const buildConfig = await validateConfig(
            url.fileURLToPath(
                new URL('../../projects/standard', import.meta.url)
            )
        );

        for (const key of fileKeysToCheck) {
            const file = buildConfig[key];
            const content = await fs.readFile(file, 'utf-8');
            filesToClear.push(file);
            expect(fs.existsSync(file)).toBe(true);
            expect(typeof content).toBe('string');
        }

        expect(typeof buildConfig).toBe('object');
    });

    test(`强行指定开发环境`, async () => {
        const envLast = {
            WEBPACK_BUILD_ENV: process.env.WEBPACK_BUILD_ENV,
        };
        process.env.WEBPACK_BUILD_ENV = 'dev';

        const cwd = url.fileURLToPath(
            new URL('../../projects/standard', import.meta.url)
        );
        const buildConfig = await validateConfig(cwd);

        for (const key of fileKeysToCheck) {
            const file = buildConfig[key];
            const content = await fs.readFile(file, 'utf-8');
            filesToClear.push(file);
            expect(fs.existsSync(file)).toBe(true);
            expect(typeof content).toBe('string');
        }

        expect(typeof buildConfig).toBe('object');
        expect(buildConfig.dist).toBe(getDirDevTemp(undefined, 'build'));

        // 还原环境变量
        Object.keys(envLast).forEach((key) => {
            process.env[key] = envLast[key];
        });
    });

    test(`测试 bundleVersionsKeep 的默认值`, async () => {
        await testOnTheFly(
            {},
            {},
            { bundleVersionsKeep: defaultConfig.bundleVersionsKeep }
        );
        await testOnTheFly(
            {},
            {
                koot: {
                    baseVersion: '0.8.10',
                },
            },
            { bundleVersionsKeep: false }
        );
    });
});
