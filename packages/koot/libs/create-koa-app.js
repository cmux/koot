import Koa from 'koa';
import helmet from 'koa-helmet';

import removeSlashes from './koa-middlewares/remove-slashes.js';

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

export default create;
