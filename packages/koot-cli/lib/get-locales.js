import url from 'node:url';
import fs from 'fs-extra';
import osLocale from 'os-locale';

module.exports = async () => {
    const locale = (await osLocale()).replace(/-/g, '_');
    const file = url.fileURLToPath(
        new URL(`../locales/${locale.toLowerCase()}.js`, import.meta.url)
    );
    return fs.existsSync(file)
        ? await import(file)
        : await import('../locales/en_us.js');
};
