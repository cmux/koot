const Koa = require('koa');
const helmet = require('koa-helmet');

const removeSlashes = require('./koa-middlewares/remove-slashes');

/**
 * 创建 Koa App
 * @returns {Object} app
 */
const create = () => {
    const app = new Koa();
    app.use(
        helmet({
            contentSecurityPolicy: false,
        })
    );
    app.use(removeSlashes);

    return app;
};

module.exports = create;
