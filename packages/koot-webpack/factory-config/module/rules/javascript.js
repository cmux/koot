// const getDirDevCache = require('koot/libs/get-dir-dev-cache')

/**
 * Loader 规则 - Javascript
 * @param {Object} options
 * @returns {Array} rules
 */
module.exports = (kootBuildConfig = {}) => {
    const env = process.env.WEBPACK_BUILD_ENV;
    const stage = process.env.WEBPACK_BUILD_STAGE;

    const { createDll = false } = kootBuildConfig;

    //

    const ruleUseBabelLoader = (options = {}) => {
        if (typeof options.cacheDirectory === 'undefined')
            options.cacheDirectory = true;

        if (process.env.WEBPACK_BUILD_ENV === 'dev') {
            if (createDll) {
                options.__createDll = true;
                options.sourceMaps = false;
            } else {
                // options.cacheDirectory = false
            }
            options.compact = false;
            options.cacheCompression = false;
        }

        return {
            loader: require.resolve('../../../loaders/babel'),
            options
        };
    };

    // const useCacheLoader = (options = {}) => ({
    //     loader: 'cache-loader',
    //     options: {
    //         cacheDirectory: getDirDevCache(),
    //         ...options
    //     }
    // })

    const ruleUseThreadLoader = (options = {}) => ({
        loader: 'thread-loader',
        // loaders with equal options will share worker pools
        options: {
            // the number of spawned workers, defaults to (number of cpus - 1) or
            // fallback to 1 when require('os').cpus() is undefined
            // workers: 2,

            // number of jobs a worker processes in parallel
            // defaults to 20
            // workerParallelJobs: 50,

            // additional node.js arguments
            // workerNodeArgs: ['--max-old-space-size=1024'],

            // Allow to respawn a dead worker pool
            // respawning slows down the entire compilation
            // and should be set to false for development
            poolRespawn: false,

            // timeout for killing the worker processes when idle
            // defaults to 500 (ms)
            // can be set to Infinity for watching builds to keep workers alive
            poolTimeout: Infinity,

            // number of jobs the poll distributes to the workers
            // defaults to 200
            // decrease of less efficient but more fair distribution
            // poolParallelJobs: 50,

            // name of the pool
            // can be used to create different pools with elsewise identical options
            name: 'koot-dev-workers-pool',

            ...options
        }
    });

    const ruleUseLoaders = (options = {}) => [
        ruleUseThreadLoader(),
        // useCacheLoader(),
        ruleUseBabelLoader(options)
    ];

    //

    if (!createDll && env === 'dev' && stage === 'client') {
        return [
            {
                test: /\.(js|mjs|cjs)$/,
                oneOf: [
                    {
                        include: /node_modules/,
                        use: ruleUseLoaders({
                            sourceMaps: false
                        })
                    },
                    {
                        use: ruleUseLoaders()
                    }
                ]
            },
            {
                test: /\.ts$/,
                oneOf: [
                    {
                        include: /node_modules/,
                        use: ruleUseLoaders({
                            sourceMaps: false,
                            __typescript: true
                        })
                    },
                    {
                        use: ruleUseLoaders({
                            __typescript: true
                        })
                    }
                ]
            },
            {
                test: /\.jsx$/,
                use: [
                    ...ruleUseLoaders({
                        __react: true
                    }),
                    require.resolve('../../../loaders/react-hot')
                ]
            },
            {
                test: /\.tsx$/,
                use: [
                    ...ruleUseLoaders({
                        __react: true,
                        __typescript: true
                    }),
                    {
                        loader: require.resolve('../../../loaders/react-hot'),
                        options: {
                            __typescript: true
                        }
                    }
                ]
            }
        ];
    }

    if (!createDll && env === 'dev' && stage === 'server') {
        return [
            {
                test: /\.(js|mjs|cjs|jsx)$/,
                use: [
                    ...ruleUseLoaders(),
                    require.resolve('../../../loaders/koot-dev-ssr.js')
                ]
            },
            {
                test: /\.(ts|tsx)$/,
                use: [
                    ...ruleUseLoaders({
                        __typescript: true
                    }),
                    require.resolve('../../../loaders/koot-dev-ssr.js')
                ]
            }
        ];
    }

    return [
        {
            test: /\.(js|mjs|cjs|jsx)$/,
            use: ruleUseBabelLoader()
        },
        {
            test: /\.(ts|tsx)$/,
            use: ruleUseBabelLoader({ __typescript: true })
        }
    ];
};
