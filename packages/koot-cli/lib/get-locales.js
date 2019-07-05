const fs = require('fs-extra');
const path = require('path');
const osLocale = require('os-locale');

module.exports = async () => {
    const locale = (await osLocale()).replace(/-/g, '_');
    const l = fs.existsSync(
        path.resolve(__dirname, `../locales/${locale.toLowerCase()}.js`)
    )
        ? require(`../locales/${locale.toLowerCase()}`)
        : require(`../locales/en_us`);
    return l;
};
