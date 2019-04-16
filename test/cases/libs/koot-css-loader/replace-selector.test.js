const replaceSelector = require('../../../../packages/koot-webpack/loaders/css/replace-selector')

test(`测试: libs/koot-css-loader`, async () => {

    const classNameReplaceTo = `c${Date.now()}`

    const pairs = [
        ['.component', `.${classNameReplaceTo}`],
        ['.component .component', `.${classNameReplaceTo} .component`],
        ['.component .wrapper .component', `.${classNameReplaceTo} .wrapper .component`],
        ['.component > .wrapper > .component', `.${classNameReplaceTo} > .wrapper > .component`],
        ['.component ~ .component', `.${classNameReplaceTo} ~ .${classNameReplaceTo}`],
        ['.component + .component', `.${classNameReplaceTo} + .${classNameReplaceTo}`],
        ['.component[data-name=".component"]', `.${classNameReplaceTo}[data-name=".component"]`]
    ]

    for (const [selector, result] of pairs) {
        expect(replaceSelector(selector, classNameReplaceTo)).toBe(result)
    }

})
