module.exports = function (api) {
    api.cache(true);

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

            // proposal
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining',

            // syntax
        ],
    };
};
