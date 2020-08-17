module.exports = {
    root: true,
    extends: 'koot',
    env: {
        browser: true,
        node: true,
        commonjs: true,
        amd: true,
        es6: true,
        mocha: true,
        jquery: true,
        jest: true,
    },
    globals: {
        __SERVER_PORT__: 'readonly',
        __KOOT_INJECT_ATTRIBUTE_NAME__: 'readonly',
        __KOOT_INJECT_METAS_START__: 'readonly',
        __KOOT_INJECT_METAS_END__: 'readonly',
        __KOOT_PROJECT_CONFIG_PATHNAME__: 'readonly',
        __STYLE_TAG_GLOBAL_ATTR_NAME__: 'readonly',
        __STYLE_TAG_MODULE_ATTR_NAME__: 'readonly',
        __KOOT_SPA_TEMPLATE_INJECT__: 'readonly',
    },
    rules: {
        // 'no-console': 0
    },
};
