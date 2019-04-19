const styles = async (page) => {
    const tests = await page.evaluate(() => {
        var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
        //F unction to convert rgb color to hex format
        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
        function hex(x) {
            return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
        }
        return Array.from(document.querySelectorAll(`[koot-test-styles]`))
            .map(el => {
                const styles = window.getComputedStyle(el)
                const attr = el.getAttribute('koot-test-styles')
                const check = {}
                const result = {}

                attr.split(';').forEach(str => {
                    const [_prop, ..._value] = str.trim().split(':')
                    const prop = _prop.trim()
                        .split('-')
                        .reduce((result, cur) =>
                            result + cur.substr(0, 1).toUpperCase() + cur.substr(1)
                        )
                    check[prop] = _value.join('').trim()
                    result[prop] = /^rgb\([0-9, ]+?\)$/.test(styles[prop])
                        ? rgb2hex(styles[prop])
                        : styles[prop]
                })

                return {
                    check, result
                }
            })
    })
    for (const { check, result } of tests) {
        expect(check).toEqual(result)
    }
}

const customEnv = async (page, customEnv = {}) => {
    const tests = await page.evaluate((customEnv) => {
        return Object.keys(customEnv).map(key => {
            const value = customEnv[key]
            const attr = `data-custom-env-${key}`
            const el = document.querySelector(`[${attr}]`)
            return {
                check: value,
                result: el ? el.getAttribute(attr) : undefined
            }
        })
    }, customEnv)
    for (const { check, result } of tests) {
        expect(check).toEqual(result)
    }
}

module.exports = {
    styles,
    customEnv
}
