/**
 * KOA 中间件: 移除 URL 起始部分的多余斜线
 * @param {Object} koaStaticConfig
 * @return {Function}
 */
const removeSlashesMiddleware = async (ctx, next) => {
    if (/^\/{2}/.test(ctx.url)) {
        return ctx.redirect(ctx.origin + ctx.url.replace(/^\/{2}/, '/'));
    }
    await next();
};

module.exports = removeSlashesMiddleware;
