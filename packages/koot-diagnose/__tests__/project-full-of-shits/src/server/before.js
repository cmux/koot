/**
 * **服务器端生命周期**
 *
 * _创建 Koa 实例后、挂载任何中间件之前_
 */

import routes from './routes';

export default async app => {
    // 挂载路由
    app.use(routes);
};
