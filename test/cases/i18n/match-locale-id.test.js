const parseLocaleId = require('../../../packages/koot/i18n/parse-locale-id');

describe(`测试: i18n/根据输入的语种或语言列表，匹配项目语言包ID`, () => {
    test(`有完整匹配时，结果正确`, async () => {
        expect(parseLocaleId('zh-CN', ['en-US', 'zh-CN'])).toBe('zh-CN');
        expect(parseLocaleId('zh-CN', ['zh_CN', 'en-US'])).toBe('zh_CN');
        expect(parseLocaleId('zh-CN', ['zh-CN'])).toBe('zh-CN');
        expect(parseLocaleId('zh', ['zh-CN', 'zh'])).toBe('zh');
        expect(
            parseLocaleId('ja,zh-CN;q=0.8,en;q=0.6', ['en-US', 'zh-CN'])
        ).toBe('zh-CN');
        expect(
            parseLocaleId('ja,zh-CN;q=0.8,en;q=0.6', ['zh-CN', 'en-US'])
        ).toBe('zh-CN');
        expect(parseLocaleId('ja,zh-CN;q=0.8,en;q=0.6', ['zh-CN'])).toBe(
            'zh-CN'
        );
        expect(
            parseLocaleId('zh-CN,zh;q=0.8,en;q=0.6', ['en-US', 'zh-CN'])
        ).toBe('zh-CN');
        expect(
            parseLocaleId('zh-CN,zh;q=0.8,en;q=0.6', ['zh-CN', 'en-US'])
        ).toBe('zh-CN');
        expect(parseLocaleId('zh-CN,zh;q=0.8,en;q=0.6', ['zh-CN'])).toBe(
            'zh-CN'
        );
        expect(parseLocaleId(['ja', 'zh-CN'], ['en-US', 'zh-CN'])).toBe(
            'zh-CN'
        );
        expect(parseLocaleId(['ja', 'zh-CN'], ['zh-CN', 'en-US'])).toBe(
            'zh-CN'
        );
        expect(parseLocaleId(['ja', 'zh-CN'], ['zh-CN'])).toBe('zh-CN');
        expect(parseLocaleId(['zh-CN', 'ja'], ['en-US', 'zh-CN'])).toBe(
            'zh-CN'
        );
        expect(parseLocaleId(['zh-CN', 'ja'], ['zh-CN', 'en-US'])).toBe(
            'zh-CN'
        );
        expect(parseLocaleId(['zh-CN', 'ja'], ['zh-CN'])).toBe('zh-CN');
    });
    test(`没有完整匹配时，结果正确`, async () => {
        expect(parseLocaleId('zh', ['en-US', 'zh-CN'])).toBe('zh-CN');
        expect(parseLocaleId('zh', ['zh-CN', 'en-US'])).toBe('zh-CN');
        expect(parseLocaleId('zh', ['zh-CN'])).toBe('zh-CN');
        expect(parseLocaleId('zh', ['en-US', 'zh-CN', 'zh-TW'])).toBe('zh-CN');
        expect(parseLocaleId('zh', ['zh_TW', 'zh-CN', 'en-US'])).toBe('zh_TW');
        expect(parseLocaleId('zh-CN', ['en-US', 'zh'])).toBe('zh');
        expect(parseLocaleId('zh-CN', ['en-US', 'zh', 'zh-TW'])).toBe('zh');
        expect(parseLocaleId('zh-CN', ['en-US', 'zh-TW', 'zh'])).toBe('zh');
        expect(parseLocaleId('zh-CN', ['zh', 'en-US'])).toBe('zh');
        expect(parseLocaleId('zh-CN', ['zh'])).toBe('zh');
        expect(parseLocaleId('zh-CN', ['en-US', 'zh-TW'])).toBe('zh-TW');
        expect(parseLocaleId('zh-CN', ['zh-TW', 'en-US'])).toBe('zh-TW');
        expect(parseLocaleId('zh-CN', ['zh-TW'])).toBe('zh-TW');
    });
    test(`之前的条件，大小写混用，连接线混用，结果正确`, async () => {
        expect(parseLocaleId('zh-CN', ['en-US', 'zH-cn'])).toBe('zH-cn');
        expect(parseLocaleId('zh-CN', ['zh-cn', 'en-US'])).toBe('zh-cn');
        expect(parseLocaleId('zh-CN', ['zh-Cn'])).toBe('zh-Cn');
        expect(
            parseLocaleId('ja,zh-CN;q=0.8,en;q=0.6', ['en-US', 'Zh-CN'])
        ).toBe('Zh-CN');
        expect(
            parseLocaleId('ja,zh-cn;q=0.8,en;q=0.6', ['zH-CN', 'en-US'])
        ).toBe('zH-CN');
        expect(parseLocaleId('ja,zh-cn;q=0.8,en;q=0.6', ['zh-cN'])).toBe(
            'zh-cN'
        );
        expect(
            parseLocaleId('zh-cn,zh;q=0.8,en;q=0.6', ['en-US', 'zh-CN'])
        ).toBe('zh-CN');
        expect(
            parseLocaleId('zh-cn,zh;q=0.8,en;q=0.6', ['zh-CN', 'en-US'])
        ).toBe('zh-CN');
        expect(parseLocaleId('zh-cn,zh;q=0.8,en;q=0.6', ['zh_CN'])).toBe(
            'zh_CN'
        );
        expect(parseLocaleId(['ja', 'zh-CN'], ['en-US', 'ZH-CN'])).toBe(
            'ZH-CN'
        );
        expect(parseLocaleId(['ja', 'zh-CN'], ['ZH-CN', 'en-US'])).toBe(
            'ZH-CN'
        );
        expect(parseLocaleId(['ja', 'zh-CN'], ['ZH-CN'])).toBe('ZH-CN');
        expect(parseLocaleId(['zh-CN', 'ja'], ['en-US', 'zH-CN'])).toBe(
            'zH-CN'
        );
        expect(parseLocaleId(['zh-CN', 'ja'], ['zH-CN', 'en-US'])).toBe(
            'zH-CN'
        );
        expect(parseLocaleId(['zh-CN', 'ja'], ['zH-CN'])).toBe('zH-CN');
        expect(parseLocaleId('zh', ['zh_Tw', 'zh-CN', 'en-US'])).toBe('zh_Tw');
    });
    test(`没有匹配时，结果正确`, async () => {
        expect(parseLocaleId('ja', ['en-US', 'zh-CN'])).toBe('en-US');
        expect(parseLocaleId('ja,zh-CN;q=0.8', ['en-US'])).toBe('en-US');
        expect(parseLocaleId(['ja', 'zh-CN'], ['en-US'])).toBe('en-US');
    });
});
