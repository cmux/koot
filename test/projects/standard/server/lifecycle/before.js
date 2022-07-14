import serverRouter from '../router';

export default async (app) => {
    app.use(async (ctx, next) => {
        ctx.cookies.set('kootTest', 'valueForKootTest', { maxAge: 0 });
        ctx.cookies.set('kootTest2', 'valueForKootTest2', { maxAge: 0 });
        ctx.cookies.set('kootTest3', 'koot=koot==koot===', { maxAge: 0 });
        return await next();
    });
    serverRouter(app);
};
