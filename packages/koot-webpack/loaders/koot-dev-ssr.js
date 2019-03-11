module.exports = source => {
    // if (/^\/\* __KOOT_DEV_SSR__ \*\/$/m.test(source)) {
    //     console.log('aaa')
    // }

    if (process.env.WEBPACK_BUILD_ENV !== 'dev')
        return source

    return source.replace(
        /^\/\* __KOOT_DEV_SSR__ \*\/$/m,
        `if (__DEV__) { require('../../'); global.__KOOT_SSR__ = {} }`
    )
}
