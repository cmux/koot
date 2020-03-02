const validateInject = require('../React/validate-inject');

module.exports = (options = {}) => {
    const {
        injectCache,

        localeId,
        localeFileMap,
        defaultLocaleId,

        filemap,
        entrypoints,
        compilation,

        needInjectCritical
    } = options;

    return validateInject({
        injectCache,

        localeId,
        localeFileMap,
        defaultLocaleId,

        filemap,
        entrypoints,
        compilation,

        title: process.env.KOOT_PROJECT_NAME,
        metas: '',
        reactHtml: '<!-- REACT ROOT -->',
        stylesHtml: '',
        reduxHtml: '',

        needInjectCritical
    });
};
