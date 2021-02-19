const {
    REACT_REPLACE_MEMO_IN_DEV_FLAG: PLUGIN_FLAG,
    REACT_REPLACE_MEMO_IN_DEV_DEFAULT_INDENTIFIER: DEFAULT_IDENTIFIER,
    REACT_REPLACE_MEMO_IN_DEV_MEMO_LOCAL_INDENTIFIER: MEMO_LOCAL_IDENTIFIER,
} = require('./_state');

/**
 * 判断是否存在 react 的引用，如果没有，自动添加
 * @param {*} babel
 */
module.exports = (babel) => {
    const { types: t } = babel;
    return {
        name: 'koot-babel-react-replace-memo-in-dev-plugin',
        visitor: {
            ImportDeclaration: (path, state) => {},
            CallExpression: (path, state) => {},
        },
    };
};
