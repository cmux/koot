const {
    REACT_REPLACE_MEMO_IN_DEV_DEFAULT_INDENTIFIER: DEFAULT_IDENTIFIER,
    REACT_REPLACE_MEMO_IN_DEV_MEMO_LOCAL_INDENTIFIER: LOCAL_IDENTIFIER,
} = require('./_state');

/**
 * 判断是否存在 react 的引用，如果没有，自动添加
 * @param {*} babel
 */
module.exports = (babel) => {
    // const { types: t } = babel;
    return {
        name: 'koot-babel-react-replace-memo-in-dev-plugin',
        visitor: {
            Program: (path, state) => {
                if (!Array.isArray(state[DEFAULT_IDENTIFIER]))
                    state[DEFAULT_IDENTIFIER] = [];
                if (!Array.isArray(state[LOCAL_IDENTIFIER]))
                    state[LOCAL_IDENTIFIER] = [];
            },
            ImportDeclaration: (path, state) => {
                const { specifiers, source } = path.node;
                if (
                    source.type === 'StringLiteral' &&
                    source.value === 'react'
                ) {
                    for (const specifier of specifiers) {
                        if (
                            specifier.type === 'ImportDefaultSpecifier' &&
                            !state[DEFAULT_IDENTIFIER].includes(
                                specifier.local.name
                            )
                        )
                            state[DEFAULT_IDENTIFIER].push(
                                specifier.local.name
                            );
                        else if (
                            specifier.type === 'ImportSpecifier' &&
                            specifier.imported.name === 'memo' &&
                            !state[LOCAL_IDENTIFIER].includes(
                                specifier.local.name
                            )
                        )
                            state[LOCAL_IDENTIFIER].push(specifier.local.name);
                    }
                    // console.log(' \n\n\n');
                    // console.log(
                    //     { specifiers, source },
                    //     state[DEFAULT_IDENTIFIER],
                    //     state[LOCAL_IDENTIFIER]
                    // );
                }
            },
            CallExpression: (path, state) => {
                // console.log(' ');
                if (!path.node.arguments.length) return;

                const { callee } = path.node;

                if (
                    (callee.type === 'MemberExpression' &&
                        state[DEFAULT_IDENTIFIER].includes(
                            callee.object.name
                        ) &&
                        callee.property.name === 'memo') ||
                    (callee.type === 'Identifier' &&
                        state[LOCAL_IDENTIFIER].includes(callee.name))
                ) {
                    path.replaceWith(path.node.arguments[0]);
                }
                // console.log(
                //     'MemberExpression',
                //     callee.object.name,
                //     callee.property.name
                // );
                // if (
                //     callee.type === 'Identifier' &&
                //     state[LOCAL_IDENTIFIER].includes(callee.name)
                // ) {
                //     console.log('Identifier', callee.name);
                // }
            },
        },
    };
};
