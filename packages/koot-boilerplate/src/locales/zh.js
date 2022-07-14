/* eslint-disable no-template-curly-in-string */

module.exports = {
    title: 'Koot.js Tech Demo',
    intro: ['React 全栈开发框架', '同样适用于 SPA'],
    navs: {
        home: 'Koot.js',
        docs: '开发文档',
        github: 'Github',
    },
    pages: {
        home: {
            title: '欢迎',
            description: 'Koot.js Tech Demo 模板/脚手架项目。',
            start: '快速上手',
        },
        start: {
            title: '快速上手',
            titles: {
                checkout: '检阅文件',
                learn: '了解',
                learnMore: '了解更多...',
            },
            description: '开发 Koot.js 项目的快速上手指南。',
            linkToDoc: '查阅文档',
            listBasic: [
                {
                    checkout: '/src/index.ejs',
                    content: '渲染模板文件，可在这里编辑 HTML、EJS 代码。',
                    doc: '/template',
                },
                {
                    checkout: '/src/routes/index.js',
                    content:
                        'react-router 配置文件。在这里也可以找到 React 使用的根组件。',
                    doc: '/config?id=routes',
                },
                {
                    learn: '高阶组件: extend',
                    content:
                        '装饰 React 组件，提供数据同构、页面信息修改（<title>、<meta> 标签等）、CSS 处理等能力。',
                    doc:
                        '/react?id=%E9%AB%98%E9%98%B6%E7%BB%84%E4%BB%B6-extend',
                },
            ],
            listAdvanced: [
                {
                    title: '配置',
                    content: 'Koot.js 有很多的可配置项，以下是一些例子：',
                    list: [
                        '设置打包结果路径',
                        '模板信息注入',
                        'i18n / 多语言',
                        '定义常量，可在任意文件中使用',
                        '以及更多……',
                    ],
                    doc: '/config',
                },
                {
                    title: '创建 Redux store',
                    content:
                        'Koot.js 使用 Redux 进行状态树管理，本模板中已创建了一个基础的 Store 以供参考。有关更多信息请查阅文档。',
                    doc: '/config?id=store',
                },
                {
                    title: '部署服务器',
                    content:
                        '在成功打包后，只需要将打包结果目录中的 /server 目录部署到服务器，并使用 Node.js 执行其内的 index.js 即可正式启动服务器。',
                    doc: '/deploy',
                },
            ],
            bonus: 'Bonus',
            bonusComponentInTS: '使用 TypeScript 开发',
            bonusUpdateAppType: '更新 Store 中的随机字段 (当前: ${current})',
        },
        ts: {
            title: 'TypeScript',
            description: '使用 TypeScript 编写 React 组件',
            msg: '该 React 组件使用 TypeScript 编写！',
            msgCheckFile:
                '可检阅、编辑该文件：`/src/views/ts-example/index.tsx`。',
            back: '返回到快速上手',
        },
    },
};
