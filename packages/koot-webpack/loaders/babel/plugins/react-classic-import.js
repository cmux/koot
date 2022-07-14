const PLUGIN_FLAG = Symbol(
    '__KOOT_BABEL_PLUGIN_REACT_CLASSIC_IMPORT_NONEED_KOOT__'
);

/**
 * 判断是否存在 react 的引用，如果没有，自动添加
 * @param {*} babel
 */
module.exports = (babel) => {
    const { types: t } = babel;
    return {
        name: 'koot-babel-react-classic-import-plugin',
        visitor: {
            ImportDefaultSpecifier: (path, state) => {
                if (state[PLUGIN_FLAG]) return;
                if (path.parent.source.value === 'react')
                    state[PLUGIN_FLAG] = true;
            },
            VariableDeclarator: (path, state) => {
                if (state[PLUGIN_FLAG]) return;
                // console.log(
                //     'VariableDeclarator',
                //     path.node.id.type === 'Identifier' &&
                //         path.node.init.type === 'CallExpression' &&
                //         path.node.init.callee.type === 'Identifier' &&
                //         path.node.init.callee.name === 'require' &&
                //         path.node.init.arguments.length &&
                //         path.node.init.arguments[0].type === 'StringLiteral' &&
                //         path.node.init.arguments[0].value === 'react'
                // );
                if (
                    path.node.id &&
                    path.node.id.type === 'Identifier' &&
                    path.node.init &&
                    path.node.init.type === 'CallExpression' &&
                    path.node.init.callee.type === 'Identifier' &&
                    path.node.init.callee.name === 'require' &&
                    path.node.init.arguments.length &&
                    path.node.init.arguments[0].type === 'StringLiteral' &&
                    path.node.init.arguments[0].value === 'react'
                )
                    state[PLUGIN_FLAG] = true;
            },
            Program: {
                exit: (path, state) => {
                    // console.log('Program', state[PLUGIN_FLAG]);
                    if (state[PLUGIN_FLAG]) return;

                    path.unshiftContainer(
                        'body',
                        t.ImportDeclaration(
                            [t.importDefaultSpecifier(t.Identifier('React'))],
                            t.stringLiteral('react')
                        )
                    );
                },
            },
        },
    };
};
