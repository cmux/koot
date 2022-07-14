/**
 * For some reason, `default` export may be missing after babel compiling,
 * expecially for TSX file.
 *
 * Here's a hacky fix
 */
module.exports = function (source) {
    const expExportDefault = `export default _default`;
    source = source.replace(
        /(var _default = .+?;\n*)(;\n\n\(function \(\) \{\n[ ]*var reactHotLoader = )/gm,
        // `$1\n/* harmony default export */ __webpack_exports__["default"] = (_default)$2`
        `$1\n${expExportDefault}$2`
    );

    // if (!source.includes('__webpack_exports__["default"]')) {
    //     const match = /var\s+_default\s*=\s*(.+?);/.exec(source);
    //     if (Array.isArray(match) && match.length > 1) {
    //         source += `\n/* harmony default export */ __webpack_exports__["default"] = _default;\n`;
    //     }
    // }

    if (!source.includes(expExportDefault)) {
        const match = /var\s+_default\s*=\s*.+?;/.exec(source);
        if (Array.isArray(match) && match.length > 1) {
            source += `\n${expExportDefault};\n`;
        }
    }

    return source;
};
