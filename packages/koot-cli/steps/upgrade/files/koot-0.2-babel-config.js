const koot0_2BabelConfig = function (api) {
    api.cache(true);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false,
                },
            ],
            '@babel/preset-react',
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
            '@babel/plugin-syntax-dynamic-import',

            // other
            'react-hot-loader/babel',
        ],
    };
};

export default koot0_2BabelConfig;
