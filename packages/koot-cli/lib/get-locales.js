import url from 'node:url';
import fs from 'fs-extra';
import { osLocale } from 'os-locale';

const getLocales = async () => {
    const locale = (await osLocale()).replace(/-/g, '_');
    const fileUrl = new URL(
        `../locales/${locale.toLowerCase()}.js`,
        import.meta.url
    );
    return (
        fs.existsSync(url.fileURLToPath(fileUrl))
            ? await import(fileUrl)
            : await import(new URL('../locales/en_us.js', import.meta.url))
    ).default;
};

export default getLocales;
