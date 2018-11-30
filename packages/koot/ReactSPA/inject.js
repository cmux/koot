const validateInject = require('../React/validate-inject')

module.exports = (options = {}) => {
    const {
        localeId,
        filemap,
        entrypoints,
        needInjectCritical,
        compilation,
    } = options

    return validateInject({
        localeId,

        filemap,
        entrypoints,
        compilation,

        title: process.env.KOOT_PROJECT_NAME,
        metas: '',
        reactHtml: '<!-- REACT ROOT -->',
        stylesHtml: '',
        reduxHtml: '',

        needInjectCritical,
    })
}
