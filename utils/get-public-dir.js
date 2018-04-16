module.exports = () =>
    __DEV__
        ? `http://localhost:${process.env.WEBPACK_DEV_SERVER_PORT || 3001}/dist/`
        : `/`