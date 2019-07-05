const { getOptions } = require('loader-utils');

/**
 * For some reason, `default` export may be missing after babel compiling,
 * expecially for TSX file.
 *
 * Here's a hacky fix
 */
module.exports = function(source) {
    if (process.env.WEBPACK_BUILD_ENV !== 'dev') return source;

    const { __react = false } = getOptions(this) || {};

    if (!__react) return source;

    source = source.replace(
        /(var _default = .+?;\n*)(;\n\n\(function \(\) \{\n[ ]*var reactHotLoader = )/gm,
        `$1\n/* harmony default export */ __webpack_exports__["default"] = (_default)$2`
    );

    if (!source.includes('__webpack_exports__["default"]')) {
        const match = /var\s+_default\s*=\s*(.+?);/.exec(source);
        if (Array.isArray(match) && match.length > 1) {
            source += `\n/* harmony default export */ __webpack_exports__["default"] = ${
                match[1]
            };\n`;
        }
    }

    return source;
};
