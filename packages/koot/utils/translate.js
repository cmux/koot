const getLocales = require('./get-locales');

let l;

/**
 * CMD环境：翻译指定字段
 * @param {*} args
 */
module.exports = (...args) => {
    if (typeof l === 'undefined') l = getLocales();

    let key = '';
    let str;
    let options = {};
    const keys = [];

    args.forEach((value, index) => {
        if (
            index === args.length - 1 &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {
            options = value;
            return;
        }
        if (typeof value === 'string' && value.includes('.')) {
            value.split('.').forEach((value) => keys.push(value));
            return;
        }
        keys.push(value);
    });

    const length = keys.length;

    if (typeof keys[0] === 'object') {
        key = keys[0];
        for (let i = 1; i < length; i++) {
            if (typeof key[keys[i]] !== 'undefined') key = key[keys[i]];
        }
        if (typeof key === 'object') key = keys[length - 1];
    } else {
        for (let i = 0; i < length; i++) {
            key += (i ? '.' : '') + keys[i];
        }
    }

    // console.log(keys, length, key)

    if (typeof l === 'undefined') {
        str = key;
    } else {
        str = l && typeof l[key] !== 'undefined' ? l[key] : undefined;
    }
    // const localeId = _self.curLocaleId

    if (typeof str === 'undefined') {
        try {
            // eslint-disable-next-line no-eval
            str = eval('l.' + key);
        } catch (e) {}
        if (typeof str === 'undefined') {
            try {
                // eslint-disable-next-line no-eval
                str = eval('l["' + key.split('.').join('"]["') + '"]');
            } catch (e) {}
        }
    }

    if (typeof str === 'undefined') str = key;

    if (typeof str === 'string')
        return str.replace(/\$\{([^}]+)\}/g, (match, p) =>
            typeof options[p] === 'undefined' ? p : options[p]
        );
    else return str;
};
