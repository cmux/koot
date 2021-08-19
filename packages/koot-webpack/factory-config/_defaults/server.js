module.exports = {
    module: {
        generator: {
            asset: {
                // emit: false,
            },
            'asset/inline': {},
            'asset/resource': {
                emit: false,
                filename: 'static/[hash][ext]',
            },
        },
    },
};
