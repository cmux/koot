/**
 * puppeteer 测试
 *
 * 针对 className 命名空间，测试对应元素的样式正确性
 *
 * @void
 * @param {*} page
 */
const styles = async page => {
    const tests = await page.evaluate(() => {
        var hexDigits = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'a',
            'b',
            'c',
            'd',
            'e',
            'f'
        ];
        //F unction to convert rgb color to hex format
        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
        function hex(x) {
            return isNaN(x)
                ? '00'
                : hexDigits[(x - (x % 16)) / 16] + hexDigits[x % 16];
        }
        return Array.from(document.querySelectorAll(`[koot-test-styles]`)).map(
            el => {
                const styles = window.getComputedStyle(el);
                const attr = el.getAttribute('koot-test-styles');
                const check = {};
                const result = {};

                attr.split(';').forEach(str => {
                    const [_prop, ..._value] = str.trim().split(':');
                    const prop = _prop
                        .trim()
                        .split('-')
                        .reduce(
                            (result, cur) =>
                                result +
                                cur.substr(0, 1).toUpperCase() +
                                cur.substr(1)
                        );
                    check[prop] = _value.join('').trim();
                    result[prop] = /^rgb\([0-9, ]+?\)$/.test(styles[prop])
                        ? rgb2hex(styles[prop])
                        : styles[prop];
                });

                return {
                    check,
                    result
                };
            }
        );
    });
    for (const { check, result } of tests) {
        expect(check).toEqual(result);
    }
};

/**
 * puppeteer 测试
 *
 * 自定义环境变量
 *
 * @void
 * @param {*} page
 */
const customEnv = async (page, customEnv = {}) => {
    const tests = await page.evaluate(customEnv => {
        return Object.keys(customEnv).map(key => {
            const value = customEnv[key];
            const attr = `data-custom-env-${key}`;
            const el = document.querySelector(`[${attr}]`);
            return {
                check: value,
                result: el ? el.getAttribute(attr) : undefined
            };
        });
    }, customEnv);
    for (const { check, result } of tests) {
        expect(check).toEqual(result);
    }
};

/**
 * puppeteer 测试
 *
 * `inject.scripts` 内必须都是 script 节点
 *
 * @void
 * @param {*} page
 */
const injectScripts = async page => {
    //koot-test-scripts
    const result = await page.evaluate(() => {
        const container = document.querySelector('#koot-test-scripts');
        if (!container) {
            console.warn('`#koot-test-scripts` not found');
            return true;
        }
        return [...container.childNodes].every(
            node => node.tagName && node.tagName.toLowerCase() === 'script'
        );
    });
    expect(result).toBe(true);
};

module.exports = {
    styles,
    customEnv,
    injectScripts
};
