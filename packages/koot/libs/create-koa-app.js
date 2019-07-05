const Koa = require('koa');
const helmet = require('koa-helmet');

/**
 * 创建 Koa App
 * @returns {Object} app
 */
const create = () => {
    const app = new Koa();
    app.use(helmet());

    return app;
};

module.exports = create;
