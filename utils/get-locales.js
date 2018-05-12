const fs = require('fs-extra')
const path = require('path')
const osLocale = require('os-locale')

module.exports = () => {
    const locale = osLocale.sync()
    let pathname

    pathname = path.resolve(__dirname, `../locales/${locale}.json`)
    if (fs.existsSync(pathname)) return fs.readJsonSync(pathname)

    pathname = path.resolve(__dirname, `../locales/${locale.toLowerCase()}.json`)
    if (fs.existsSync(pathname)) return fs.readJsonSync(pathname)

    pathname = path.resolve(__dirname, `../locales/${locale.replace(/_/g, '-')}.json`)
    if (fs.existsSync(pathname)) return fs.readJsonSync(pathname)

    pathname = path.resolve(__dirname, `../locales/${locale.replace(/_/g, '-').toLowerCase()}.json`)
    if (fs.existsSync(pathname)) return fs.readJsonSync(pathname)

    pathname = path.resolve(__dirname, `../locales/${locale.split('_')[0]}.json`)
    if (fs.existsSync(pathname)) return fs.readJsonSync(pathname)

    pathname = path.resolve(__dirname, `../locales/en.json`)
    return fs.readJsonSync(pathname)

    // const l = fs.existsSync(path.resolve(__dirname, `../locales/${locale.toLowerCase()}.js`))
    //     ? require(`../locales/${locale.toLowerCase()}`)
    //     : require(`../locales/en_us`)
    // return l
}
