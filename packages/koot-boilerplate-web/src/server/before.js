import routes from './routes'

export default async (app) => {

    // 挂载路由
    app.use(routes)
}
