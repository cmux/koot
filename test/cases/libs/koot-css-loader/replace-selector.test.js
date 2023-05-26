import replaceSelector from '../../../../packages/koot-webpack/loaders/css/replace-selector.js';

test(`测试: libs/koot-css-loader`, async () => {
    const classNameReplaceTo = `c${Date.now()}`;

    const pairs = [
        ['.component', `.${classNameReplaceTo}`],
        ['.component-inner', `.${classNameReplaceTo}-inner`],
        ['.component .component', `.${classNameReplaceTo} .component`],
        [
            '.component .component .component',
            `.${classNameReplaceTo} .component .component`,
        ],
        [
            '.component .component .component[data-name="test"]',
            `.${classNameReplaceTo} .component .component[data-name="test"]`,
        ],
        [
            '.component .component .component[data-name=".component"]',
            `.${classNameReplaceTo} .component .component[data-name=".component"]`,
        ],
        [
            '.component .component-inner',
            `.${classNameReplaceTo} .${classNameReplaceTo}-inner`,
        ],
        [
            '.component .wrapper .component',
            `.${classNameReplaceTo} .wrapper .component`,
        ],
        [
            '.component > .wrapper > .component',
            `.${classNameReplaceTo} > .wrapper > .component`,
        ],
        [
            '.component ~ .component',
            `.${classNameReplaceTo} ~ .${classNameReplaceTo}`,
        ],
        [
            '.component + .component',
            `.${classNameReplaceTo} + .${classNameReplaceTo}`,
        ],
        [
            '.component[data-name=".component"]',
            `.${classNameReplaceTo}[data-name=".component"]`,
        ],
        ['body.test .component', `body.test .${classNameReplaceTo}`],
        [
            'body.test .component.test2',
            `body.test .${classNameReplaceTo}.test2`,
        ],
        [
            'body.test .component.test2 .component',
            `body.test .${classNameReplaceTo}.test2 .component`,
        ],
    ];

    for (const [selector, result] of pairs) {
        expect(replaceSelector(selector, classNameReplaceTo)).toBe(result);
    }
});
