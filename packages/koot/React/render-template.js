const ejs = require('ejs');

const readClientFile = require('../utils/read-client-file');
const getClientFilePath = require('../utils/get-client-file-path');

/**
 * 渲染 ejs 模板
 * @param {Object} options
 * @param {String} options.template ejs 模板内容
 * @param {Object} [options.inject={}] 注入对象
 * @param {Object} [options.state] 当前 Redux state。也可以传入 Redux store
 * @param {Object} [options.compilation] webpack compilation
 * @param {Object} [options.localeId] 强制更变为目标语种
 * @returns {String}
 */
module.exports = ({
    template = DEFAULT_TEMPLATE,
    inject = {},
    store,
    state,
    compilation,
    ctx,
    localeId,
}) => {
    if (
        typeof state !== 'object' &&
        typeof store === 'object' &&
        typeof store.getState === 'function'
    )
        state = store.getState();
    else if (typeof state === 'object' && typeof state.getState === 'function')
        state = state.getState();

    try {
        for (const key in inject) {
            if (typeof inject[key] === 'function')
                inject[key] = inject[key](template, state, ctx);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        // console.log(e);
        throw e;
    }

    // 开发环境: 将 content('critical.js') 转为 pathname() 方式
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        template = template.replace(
            /<script(.*?)><%(.*?)content\(['"]critical\.js['"]\)(.*?)%><\/script>/,
            `<script$1 src="<%$2pathname('critical.js')$3%>"></script>`
        );

    // console.log(template)

    const thisLocaleId =
        localeId || (typeof state === 'object' ? state.localeId : undefined);

    return ejs.render(
        template,
        {
            inject,
            content: (filename) =>
                readClientFile(filename, thisLocaleId, compilation),
            pathname: (filename) => getClientFilePath(filename, thisLocaleId),
        },
        {}
    );
};

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>

<head<%- inject.htmlLang %>>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">

    <title><%= inject.title %></title>

    <base target="_self">

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="format-detection" content="telephone=no,email=no,address=no">
    <meta name="format-detection" content="email=no">
    <meta name="format-detection" content="address=no">
    <meta name="format-detection" content="telephone=no">
    <meta name="HandheldFriendly" content="true">
    <meta name="mobile-web-app-capable" content="yes">

    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">

    <!-- IE/Edge/Multi-engine -->
    <meta name="renderer" content="webkit">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <!-- iOS Safari -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Customize -->
    <meta name="theme-color" content="#0092f5" />

    <%- inject.metas %>
    <%- inject.styles %>
</head>

<body class="koot-system">
    <div id="root"><%- inject.react %></div>
    <script type="text/javascript"><%- content('critical.js') %></script>
    <%- inject.scripts %>
</body>

</html>`;
