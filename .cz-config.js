module.exports = {
    types: [
        { value: 'feat', name: 'feat:     新特性/功能' },
        { value: 'fix', name: 'fix:      BUG修正' },
        { value: 'docs', name: 'docs:     文档/注释' },
        {
            value: 'refactor',
            name: 'refactor: 重构，既不是BUG修正也不是添加新功能',
        },
        {
            value: 'perf',
            name: 'perf:     效率优化',
        },
        {
            value: 'chore',
            name: 'chore:    更改构建流程、更新辅助代码或依赖库',
        },
        {
            value: 'style',
            name: 'style:    代码风格与样式，不影响功能 (空行、格式、分号等)',
        },
        { value: 'test', name: 'test:     测试' },
        { value: 'revert', name: 'revert:   回滚' },
        { value: 'WIP', name: 'WIP:      Work in progress' },
    ],

    scopes: [
        // { name: 'ROOT' },
        { name: 'core' },
        { name: 'webpack' },
        { name: 'unit-test' },
        { name: '[TARGET] electron' },
        { name: '[TARGET] qiankun' },
        { name: '[TOOL] boilerplate' },
        { name: '[TOOL] cli' },
    ],

    allowTicketNumber: false,
    isTicketNumberRequired: false,
    ticketNumberPrefix: 'TICKET-',
    ticketNumberRegExp: '\\d{1,5}',

    // it needs to match the value for field type. Eg.: 'fix'
    /*
    scopeOverrides: {
      fix: [
        {name: 'merge'},
        {name: 'style'},
        {name: 'e2eTest'},
        {name: 'unitTest'}
      ]
    },
    */
    // override the messages, defaults are as follows
    messages: {
        type: '请选择本次提交的改动内容的类型:',
        scope: '请选择这些改动的范围 (选填):',
        // used if allowCustomScopes is true
        customScope: '请选择这些改动的范围:',
        subject: '请为本次改动编写一句**言简意赅**的描述:\n',
        body: '请为本次改动编写一段**详细**的描述 (选填)。使用 "|" 折行:\n',
        breaking: '请列出**重大改动**(BREAKING CHANGES) (选填):\n',
        footer: '请列出对应的**问题代码**以将其关闭 (选填)。例如: #31, #34:\n',
        confirmCommit: '是否确认按这些内容进行提交?',
    },

    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix', 'deps'],
    // skip any questions you want
    skipQuestions: ['body'],

    // limit subject length
    subjectLimit: 100,
    // breaklineChar: '|', // It is supported for fields body and footer.
    // footerPrefix : 'ISSUES CLOSED:'
    // askForBreakingChangeFirst : true, // default is false
};
