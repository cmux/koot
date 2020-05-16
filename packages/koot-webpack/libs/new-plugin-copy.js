const fs = require('fs-extra');
const path = require('path');
const merge = require('lodash/merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const newPluginCopyWebpack = (...args) => {
    if (Array.isArray(args[0]))
        return newPluginCopyWebpack({
            patterns: args[0],
            options: args[1] || {},
        });

    const { patterns = [], options = {} } = args[0] || {};
    const patternDefaults = {
        globOptions: {},
    };

    // 处理 options ============================================================
    if (typeof options.ignore !== 'undefined') {
        patternDefaults.globOptions.ignore = options.ignore;
        delete options.ignore;
    }
    if (typeof options.test !== 'undefined') {
        patternDefaults.transformPath = options.test;
        delete options.test;
    }

    // 处理 patterns ===========================================================
    const updatePattern = (pattern = {}, index) => {
        const thisPattern = merge(pattern, patternDefaults);
        for (const [key, value] of Object.entries(thisPattern)) {
            if (typeof value === 'object' && Object.keys(value).length < 1) {
                delete thisPattern[key];
            }
        }

        if (typeof thisPattern.from === 'string') {
            thisPattern.from = thisPattern.from.replace(/\\/g, '/');
            if (path.isAbsolute(thisPattern.from)) {
                if (fs.lstatSync(thisPattern.from).isDirectory())
                    thisPattern.from =
                        thisPattern.from.replace(/\\/g, '/') + '/**/*';
            } else {
            }
        }
        if (!thisPattern.to) delete thisPattern.to;

        patterns[index] = thisPattern;
    };
    patterns.forEach((pattern, index) => {
        if (typeof pattern === 'string') {
            updatePattern(
                {
                    from: pattern,
                },
                index
            );
        } else if (
            typeof pattern === 'object' &&
            typeof pattern.glob === 'string'
        ) {
            const {
                glob: from,
                to,
                context,
                toType,
                force,
                flatten,
                transform,
                cacheTransform,
                transformPath,
                noErrorOnMissing,
                globOptions: _globOptions = {},
                ...globOptions
            } = pattern;
            updatePattern(
                {
                    from,
                    to,
                    context,
                    toType,
                    force,
                    flatten,
                    transform,
                    cacheTransform,
                    transformPath,
                    noErrorOnMissing,
                    globOptions: Object.assign(globOptions, _globOptions),
                },
                index
            );
        } else {
            updatePattern(pattern, index);
        }
    });

    // console.log(patterns);
    return new CopyWebpackPlugin({
        patterns,
        options,
    });
};

module.exports = newPluginCopyWebpack;
