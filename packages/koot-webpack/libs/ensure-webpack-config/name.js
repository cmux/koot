function ensureConfigName(webpackConfig, name) {
    if (typeof webpackConfig.name !== 'undefined') return webpackConfig;

    webpackConfig.name = ['koot', name /*, webpackConfig.mode || ''*/]
        .filter((v) => !!v)
        .join('-');

    return webpackConfig;
}

module.exports = ensureConfigName;
