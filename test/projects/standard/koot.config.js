/** @module kootConfig */

/**
 * 路径名，可为相对路径或绝对路径。由于部分代码使用了 import/export 的写法，node.js 无法直接识别，需要 webpack/babel 进行编译，故在部分环境下使用该写法代替 require()。
 * @typedef {String} Pathname
 */

/**
 * @callback cacheGet
 * 缓存检查与吐出方法
 * @param {String} url
 * @return {Boolean|String} 对该 URL 不使用缓存时返回 false，使用时返回缓存结果 String
 */

/**
 * @callback cacheSet
 * 缓存存储方法
 * @param {String} url 
 * @param {String} html 
 */

const fs = require('fs-extra')
const path = require('path')

module.exports = {

    /** @type {String} 项目名称 */
    name: 'Koot Boilerplate',

    /**
     * @type {String} 项目类型
     * @default react 默认为 React 同构项目
     */
    type: 'react',

    /** @type {Pathname} HTML 模板 */
    template: './src/template.ejs',

    /** @type {Pathname} React 路由 */
    router: './src/router',

    /**
     * @type {Object} Redux 配置
     * @namespace
     * @property {Pathname} [combineReducers] reducer，与 combineReducers 参数语法相同
     * @property {Pathname} [store] 使用自创建的 store，而非 koot 创建的 store。如果提供，会忽略 combineReducers 属性。详细使用方法请参阅 [文档](https://koot.js.org/react/create-store)
     */
    redux: {
        // combineReducers: './src/store/reducers',
        store: './src/store/create',
    },

    /**
     * @type {Object} 客户端/浏览器端相关配置
     * @namespace
     * @property {String} [historyType=(browser|hash)] - 客户端中路由 (`router`) 所用的历史对象 (`history`) 类型
     * @property {Pathname} [before] - 回调函数：在 React 初始化前
     * @property {Pathname} [after] - 回调函数：在 React 初始化完成后
     * @property {Pathname} [onRouterUpdate] - 回调函数：在路由发生改变时
     * @property {Pathname} [onHistoryUpdate] - 回调函数：在浏览器历史发生改变时时
     */
    client: {
        // historyType: 'hash',
        before: './src/services/lifecycle/before',
        after: './src/services/lifecycle/after',
        onRouterUpdate: './src/services/lifecycle/on-router-update',
        onHistoryUpdate: './src/services/lifecycle/on-history-update',
    },

    /** 
     * @type {(Object)} 服务器端端相关配置
     * @namespace
     * @property {Object} [koaStatic] - KOA 静态资源服务器扩展配置
     * @property {Object} [renderCache] - 同构渲染缓存设置 (开发模式下禁用)
     * @property {Number} [renderCache.maxAge=1000] - 同构渲染缓存最大存在时间 (单位: ms)
     * @property {Number} [renderCache.maxCount=50] - 同构渲染缓存最多缓存的 URL 的数量
     * @property {cacheGet} [renderCache.get] - 自定义缓存检查与吐出方法。存在时, maxAge 和 maxCount 设置将被忽略
     * @property {cacheSet} [renderCache.set] - 自定义缓存存储方法。存在时, maxAge 和 maxCount 设置将被忽略
     * @property {Object} [proxyRequestOrigin] - （仅生产模式）若本 Node.js 服务器是通过其他代理服务器请求的（如 nginx 反向代理），可用这个配置对象声明原请求的信息
     * @property {String} [proxyRequestOrigin.protocol] - 协议名
     * @property {Pathname:Object} [reducers] - 服务器端专用 Reducer，与 combineReducers 参数语法相同。会整合到 redux.combineReducers 中
     * @property {Pathname:Object} [inject] - 注入内容
     * @property {Pathname:Function} [before] - 回调：在服务器启动前
     * @property {Pathname:Function} [after] - 回调：在服务器启动完成
     * @property {Pathname:Function} [onRender] - 回调：在页面渲染时
     */
    server: {
        koaStatic: {
            maxage: 0,
            hidden: true,
            index: 'index.html',
            defer: false,
            gzip: true,
            extensions: false
        },
        renderCache: {
            maxAge: 10 * 1000,
        },
        proxyRequestOrigin: {
            // protocol: 'koot',
        },
        // reducers: './server/reducers',
        inject: './server/inject',
        before: './server/lifecycle/before',
        after: './server/lifecycle/after',
        // onRender: './server/lifecycle/on-render',
        onRender: {
            beforeDataToStore: './server/lifecycle/on-render-before-data-to-store',
            afterDataToStore: './server/lifecycle/on-render-after-data-to-store',
        },
    },

    /** 
     * @type {String} 打包目标目录
     * 默认会在该目录下建立 public 和 server 目录，分别对应 web 服务器和服务器执行代码
     * 注：如果为相对路径，请确保第一个字符为 '.'
     */
    dist: './dist/',

    /** 
     * @type {Object} Webpack 相关配置
     * @namespace
     * @property {Object|Function} config Webpack 配置对象或生成方法，可为异步方法
     * @property {Function} beforeBuild 在 Webpack 打包执行前运行的方法，可为异步
     * @property {Function} afterBuild 在 Webpack 打包完成后运行的方法，可为异步
     * @property {Object} defines 扩展 webpack.DefinePlugin 的内容
     */
    webpack: {
        config: async () => {
            const ENV = process.env.WEBPACK_BUILD_ENV
            if (ENV === 'dev') return await require('./config/webpack/dev')
            if (ENV === 'prod') return await require('./config/webpack/prod')
            return {}
        },
        beforeBuild: async (/*args*/) => {
            if (process.env.WEBPACK_BUILD_STAGE === 'client') {
                const dist = process.env.KOOT_DIST_DIR
                await fs.remove(path.resolve(dist, 'public'))
                await fs.remove(path.resolve(dist, 'server'))
            }
            return
        },
        afterBuild: async () => {
            return
        },
        defines: {
            __QA__: JSON.stringify(false),
        },
        dll: [
            'react',
            'react-dom',
            'redux',
            'redux-thunk',
            'react-redux',
            'react-router',
            'react-router-redux',
            // 'koot',
        ],
        internalLoadersOptions: {
            'less-loader': {
                modifyVars: {
                    'base-font-size': '40px'
                },
                aaa: 'bbb'
            }
        }
    },

    /** 
     * @type {Object}
     * 目录或文件别名
     * 
     * 在项目内的 JavaScript 和 CSS/LESS/SASS 中的引用方法均可直接使用这些别名，如
     *      - JavaScript: require('@app/create.js')
     *      - LESS:       @import "~base.less"
     * 
     * 建议使用绝对路径
     */
    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '@components': path.resolve('./src/components'),
        '@constants': path.resolve('./src/constants'),
        '@services': path.resolve('./src/services'),
        '@store': path.resolve('./src/store'),
        '@views': path.resolve('./src/views'),
        '@server': path.resolve('./server'),
        "~base.less": path.resolve('./src/constants/less/base.less'),
        "~Assets": path.resolve('./src/assets'),
        "~/": path.resolve('./src')
    },

    /**
     * @type {Object} CSS 打包相关设置
     * @namespace
     * @property {Object} fileBasename 文件名规则，不包含扩展名部分。规则会自动应用到 `.less` `.sass` 和 `.scss` 文件上
     * @property {RegExp} fileBasename.normal 标准 CSS 文件，在打包时不会被 koot 定制的 css-loader 处理
     * @property {RegExp} fileBasename.component 组件 CSS 文件，在打包时会被 koot 定制的 css-loader 处理
     * @property {Array} extract 这些文件在打包时会拆成独立文件
     */
    css: {
        fileBasename: {
            normal: /\.g/,
            component: /^((?!\.g\.).)*/,
        }
    },

    /** @type {(Number|Object|String)} 服务器运行端口 */
    // port: 3080,
    port: {
        dev: 8083,
        prod: 8081,
    },

    /** @type {(Boolean|Array[]|Object)} 多语言配置 */
    // i18n: false,
    i18n: [
        ['zh', './src/locales/zh.json'],
        ['zh-tw', './src/locales/zh-tw.json'],
        ['en', './src/locales/en.json'],
    ],
    // i18n: {
    //     // type: 'redux', // 仅影响 client-prod 环境
    //     // use: 'router',
    //     locales: [
    //         ['zh', './src/locales/zh.json'],
    //         ['zh-tw', './src/locales/zh-tw.json'],
    //         ['en', './src/locales/en.json'],
    //     ]
    // },

    /** 
     * @type {(Object|boolean)}
     * PWA相关设置，仅在生产环境(ENV:prod)下生效
     * 默认启用
     * 
     * @namespace
     * @property {Boolean} [auto=true] - 是否自动注册 service-worker
     * @property {String} [pathname="/service-worker.js"] - service-worker 文件输出路径
     * @property {String} [template] - 自定义 service-worker 模板文件路径
     * @property {String} [initialCache] - 初始缓存文件路径 glob
     * @property {String[]} [initialCacheAppend] - 追加初始缓存 URL
     * @property {String[]} [initialCacheIgonre] - 初始缓存列表中的忽略项
     */
    // pwa: true, // 默认值
    // pwa: false,
    pwa: {
        // auto: true,
        // pathname: '/service-worker.js',
        // template: path.resolve('./src/sw-template.js'),
        // initialCache: '/**/*',
        // initialCacheAppend: [// real urls],
        initialCacheIgonre: [
            '/dev-*',
        ]
    },

    /** 
     * @type {Object}
     * 开发模式设置
     * 除了提到的选项，其他所有选项均会扩展 webpack-dev-server 的设置
     */
    devServer: {
        // quiet: true,
        // overlay: {
        //     warnings: true,
        //     errors: true
        // }
        // historyApiFallback: false,
        proxy: {
            '/root': {
                target: 'http://localhost:8083/',
                pathRewrite: { '^/root': '' }
            }
        }
    },

    /** 
     * @type {String}
     * 静态资源文件存放路径，打包时会自动复制该目录下的所有文件到打包目录下，方便直接使用
     */
    staticAssets: path.resolve(__dirname, './public'),

}
