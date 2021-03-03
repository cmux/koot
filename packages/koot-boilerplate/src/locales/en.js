/* eslint-disable no-template-curly-in-string */

module.exports = {
    title: 'Koot.js Tech Demo',
    intro: ['React full-stack development framework', 'Also for SPA'],
    navs: {
        home: 'Koot.js',
        docs: 'Docs',
        github: 'Github',
    },
    pages: {
        home: {
            title: 'Welcome',
            description: 'Koot.js Tech Demo boilerplate/template project.',
            start: 'Quick Start',
        },
        start: {
            title: 'Quick Start',
            titles: {
                checkout: 'Check file',
                learn: 'Learn',
                learnMore: 'Learn More...',
            },
            description: 'Quick start guide for developing Koot.js project.',
            linkToDoc: 'Read API doc',
            listBasic: [
                {
                    checkout: '/src/index.ejs',
                    content:
                        'The template file for rendering. You can modify or add HTML and/or EJS code here.',
                    doc: '/template',
                },
                {
                    checkout: '/src/routes/index.js',
                    content:
                        'The config file for react-router. The root component for React can also be found here.',
                    doc: '/config?id=routes',
                },
                {
                    learn: 'HOC: extend',
                    content:
                        'Enabling data-isomorphic, page infomation modification (<title>, <meta>, etc...), CSS processing, and more for React component',
                    doc:
                        '/react?id=%E9%AB%98%E9%98%B6%E7%BB%84%E4%BB%B6-extend',
                },
            ],
            listAdvanced: [
                {
                    title: 'Configuration',
                    content:
                        "Koot.js has tons of config options. Here're some useful ones:",
                    list: [
                        'Set bundle target directory',
                        'Template injection',
                        'I18n / Localization',
                        'Define constants that can be used in any file',
                        'and more...',
                    ],
                    doc: '/config',
                },
                {
                    title: 'Create Redux store',
                    content:
                        'Koot.js uses Redux for its store management. This boilerplate comes with a basic Store created. Read document below to learn more.',
                    doc: '/config?id=store',
                },
                {
                    title: 'Deploy on server',
                    content:
                        'After a successful build, you can simply deploy the whole /server folder onto your server, and run index.js using Node.js to start SSR server. For more information, you can check API document.',
                    doc: '/deploy',
                },
            ],
            bonus: 'Bonus',
            bonusComponentInTS: 'Write in TypeScript',
            bonusUpdateAppType:
                'Update Random Value in Store (Current: ${current})',
        },
        ts: {
            title: 'TypeScript',
            description: 'A React Component that written in TypeScript',
            msg: 'React Component written in TypeScript!',
            msgCheckFile:
                'You can check and modify the file `/src/views/ts-example/index.tsx`.',
            back: 'Back to Quick Start',
        },
    },
};
