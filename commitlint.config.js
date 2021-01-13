module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            0,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'test',
                'revert',
                'deps',
            ],
        ],
    },
};
