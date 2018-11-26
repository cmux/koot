const validateInject = require('../React/validate-inject')

module.exports = (options = {}) => {
    const {
        localeId,
        filemap,
        entrypoints,
        needInjectCritical,
    } = options

    return validateInject({
        localeId,

        filemap,
        entrypoints,

        title: 'TEST',
        metas: '',
        reactHtml: '<!-- REACT ROOT -->',
        stylesHtml: '',
        reduxHtml: '',

        needInjectCritical,
    })
}
