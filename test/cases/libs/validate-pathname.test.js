import { jest } from '@jest/globals';
import fs from 'fs-extra';
import url from 'node:url';
import validatePathname from '../../../packages/koot/libs/validate-pathname.js';

jest.useFakeTimers();

const doTest = (p) => {
    const pathname = validatePathname(p);
    expect(fs.existsSync(pathname)).toBe(true);
};

describe('测试: libs/validate-pathname', () => {
    test(`当前路径的相对路径`, async () =>
        doTest(
            url.fileURLToPath(new URL('../../pre-test.js', import.meta.url))
        ));
    test(`项目根目录的相对路径 (写法#1)`, async () => doTest('LICENSE'));
    test(`项目根目录的相对路径 (写法#2)`, async () => doTest('./LICENSE'));
    test(`node_modules`, async () => doTest('koa/package.json'));
    test(`绝对路径`, async () =>
        doTest(url.fileURLToPath(new URL('', import.meta.url))));
});
