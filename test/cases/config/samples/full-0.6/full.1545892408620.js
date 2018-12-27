// 核心代码中引用的配置文件

export const name = "Koot Boilerplate";
export const type = "react";
export const template = "./src/template.ejs";
export const router = require('../../../src/router').default;
export const redux = {"store":require('../../../src/store/create').default,"syncCookie":true};
export const client = {"historyType":"hash","before":require('../../../src/services/lifecycle/before').default,"after":require('../../../src/services/lifecycle/after').default,"onRouterUpdate":require('../../../src/services/lifecycle/on-router-update').default,"onHistoryUpdate":require('../../../src/services/lifecycle/on-history-update').default};
export const server = __SERVER__ ? {"koaStatic":{"maxage":0,"hidden":true,"index":"index.html","defer":false,"gzip":true,"extensions":false},"renderCache":{"maxAge":10000},"proxyRequestOrigin":{"protocol":"koot"},"inject":require('../../../server/inject').default,"before":require('../../../server/lifecycle/before').default,"after":require('../../../server/lifecycle/after').default,"onRender":{"beforeDataToStore":require('../../../server/lifecycle/on-render-before-data-to-store').default,"afterDataToStore":require('../../../server/lifecycle/on-render-after-data-to-store').default}} : {};