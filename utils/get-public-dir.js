module.exports = () =>
    (process.env.WEBPACK_BUILD_ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__))
        ? `http://localhost:${process.env.WEBPACK_DEV_SERVER_PORT || 3001}/dist/`
        : (
            process.env.WEBPACK_BUILD_TYPE === 'spa'
                ? ''
                : `/`
        )
