module.exports = {
    plugins: {
        autoprefixer: {},
        cssnano: {
            preset: [
                'default',
                {
                    discardComments: {
                        removeAll: true,
                    },
                    camelCase: true,
                    normalizeWhitespace: false,
                    zindex: false,
                },
            ],
        },
    },
};
