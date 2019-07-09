const validateInject = require('../React/validate-inject');

module.exports = (options = {}) => {
    const {
        injectCache,
        localeId,
        filemap,
        entrypoints,
        needInjectCritical,
        compilation
    } = options;

    return validateInject({
        injectCache,
        localeId,

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
