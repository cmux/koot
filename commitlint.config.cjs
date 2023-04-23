module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-case': [0],
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'perf',
                'test',
                'revert',
                'deps',
                'chore',
                'WIP',
            ],
        ],
    },
};
