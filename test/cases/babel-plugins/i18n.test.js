const path = require('path');
const babel = require('@babel/core');
const plugin = require('../../../packages/koot-webpack/loaders/babel/plugins/i18n');

const examples = [
    `__('test')`,
    `__('object')`,
    `__('object.value1')`,
    `__('object', 'value1')`,
    `__('object.value_with_parameter')`,
    `__('object', 'value_with_parameter')`,
    `__('object.value_with_parameter', {insert: 'TEST'})`,
    `__('object', 'value_with_parameter', {insert: 'TEST'})`,

    `const t = "value1"; __('object', t)`,

    `let t;
__('object.value_with_parameter', {
    insert: t || undefined
})`,

    `let t;
__('object.value_with_parameter', {
insert: t || 'undefined'
})`,

    `let t;
__('object.value_with_parameter', {
insert: t || undefined
});
__('object', 'value_with_parameter', {insert: 'TEST'})`,
];

describe('Babel Plugin: i18n', () => {
    examples.forEach((codeOriginal, index) => {
        it(`${index}`, () => {
            const { code } = babel.transform(codeOriginal, {
                plugins: [
                    [
                        plugin,
                        {
                            stage: 'client',
                            functionName: '__',
                            localeId: 'zh',
                            localeFile: path.resolve(
                                __dirname,
                                './i18n.locales.json'
                            ),
                        },
                    ],
                ],
            });
            expect(code).toMatchSnapshot();
        });
    });
});
