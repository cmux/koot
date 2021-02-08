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
                    runtime: 'classic',
                },
            ],
            '@babel/preset-flow',
        ],
        // presets: [
        //     '@babel/preset-modules',
        //     '@babel/preset-react',
        //     '@babel/preset-flow'
        // ],
        // env: {
        //     modern: {
        //         presets: ['@babel/preset-modules']
        //     },
        //     legacy: {
        //         presets: [
        //             [
        //                 '@babel/preset-env',
        //                 {
        //                     modules: false
        //                 }
        //             ],
        //             '@babel/preset-react',
        //             '@babel/preset-flow'
        //         ]
        //     }
        // },
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
            'react-hot-loader/babel',
        ],
    };
};
