import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { osLocaleSync } from 'os-locale';

const readJsonSync = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

/**
 * CMD环境：根据本机系统语言，获取语言包内容
 * @returns {Object} 语言包内容
 */
const getLocales = () => {
    const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    const locale = osLocaleSync();
    let pathname;

    pathname = path.resolve(__dirname, `../locales/${locale}.json`);
    if (fs.existsSync(pathname)) return readJsonSync(pathname);

    pathname = path.resolve(
        __dirname,
        `../locales/${locale.toLowerCase()}.json`
    );
    if (fs.existsSync(pathname)) return readJsonSync(pathname);

    pathname = path.resolve(
        __dirname,
        `../locales/${locale.replace(/-/g, '_')}.json`
    );
    if (fs.existsSync(pathname)) return readJsonSync(pathname);

    pathname = path.resolve(
        __dirname,
        `../locales/${locale.replace(/-/g, '_').toLowerCase()}.json`
    );
    if (fs.existsSync(pathname)) return readJsonSync(pathname);

    pathname = path.resolve(
        __dirname,
        `../locales/${locale.split('-')[0]}.json`
    );
    if (fs.existsSync(pathname)) return readJsonSync(pathname);

    pathname = path.resolve(__dirname, `../locales/en.json`);
    return readJsonSync(pathname);

    // const l = fs.existsSync(path.resolve(__dirname, `../locales/${locale.toLowerCase()}.js`))
    //     ? require(`../locales/${locale.toLowerCase()}`)
    //     : require(`../locales/en_us`)
    // return l
};

export default getLocales;
