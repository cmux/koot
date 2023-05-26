import transformError from '../../../packages/koot/utils/transform-error.js';

const doTest = (sbj, msg) => {
    const newError = transformError(sbj);
    expect(newError instanceof Error).toBe(true);
    expect(newError.message).toBe(msg);
    expect(newError.msg).toBe(msg);
};

describe('测试: utils/transform-error', () => {
    test(`可使用 string 生成 Error`, async () =>
        doTest('test message', 'test message'));
    test(`可使用 Object 生成 Error`, async () =>
        doTest(
            {
                msg: 'test message',
            },
            'test message'
        ));
    test(`可使用 Error 生成 Error`, async () =>
        doTest(new Error('test message'), 'test message'));
});
