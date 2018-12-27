// 核心代码中引用的配置文件 (部分)

export const template = "./src/template.ejs";
export const redux = {"store":require('../../../src/store/create').default,"syncCookie":true};
export const server = __SERVER__ ? {"koaStatic":{"maxage":0,"hidden":true,"index":"index.html","defer":false,"gzip":true,"extensions":false},"renderCache":{"maxAge":10000},"proxyRequestOrigin":{"protocol":"koot"},"inject":require('../../../server/inject').default,"before":require('../../../server/lifecycle/before').default,"after":require('../../../server/lifecycle/after').default} : {};