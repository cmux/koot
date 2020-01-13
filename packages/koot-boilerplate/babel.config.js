module.exports = function(api) {
    api.cache(true);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false
                }
            ],
            '@babel/preset-react',
            '@babel/preset-flow'
        ],
        compact: 'auto',
        plugins: [
            // transform

            // proposal
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-proposal-class-properties'

            // syntax
        ]
    };
};
