module.exports = function (api) {
    // api.cache(true);
    api.cache(false);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false,
                },
            ],
            [
                '@babel/preset-react',
                {
                    runtime: 'automatic',
                },
            ],
            '@babel/preset-flow',
        ],
        compact: 'auto',
        plugins: [
            // transform
            '@babel/plugin-transform-regenerator',

            // proposal
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',

            // syntax
            // '@babel/plugin-syntax-dynamic-import',

            // other
            // 'react-hot-loader/babel',
        ],
    };
};
