const readLocaleFileSync = require('koot/i18n/read-locale-file-sync');

const locales = {};
const definitions = {};

const BABEL_I18N_MODIFIED = Symbol('__KOOT_BABEL_I18N_MODIFIED_KOOT_');

module.exports = (babel) => {
    const { types: t } = babel;
    return {
        name: 'koot-babel-i18n-plugin',
        visitor: {
            CallExpression: (path, state) => {
                if (state[BABEL_I18N_MODIFIED]) return;

                const _callee = path.node.callee;
                const {
                    opts: { stage, functionName, localeId, localeFile },
                } = state;

                if (functionName && _callee.name === functionName) {
                    const _arguments = path.node.arguments;
                    // console.log('\n \n');
                    // console.log({ path, state });
                    // console.log(path.context, path.scope);
                    // console.log({ _callee, _arguments });

                    if (localeId && !locales[localeId]) {
                        const loop = (obj, prefix) => {
                            for (const _key in obj) {
                                const value = obj[_key];
                                const key = prefix ? `${prefix}.${_key}` : _key;
                                definitions[localeId][key] = value;
                                if (typeof value === 'object') {
                                    loop(value, key);
                                }
                            }
                        };
                        locales[localeId] = readLocaleFileSync(localeFile);
                        loop(locales[localeId]);
                    }

                    const thisLocales = locales[localeId];
                    const thisDefinitions =
                        stage === 'client' ? definitions[localeId] : undefined;

                    // 如果有翻译定义对象，替换函数调用中的参数
                    if (thisDefinitions) {
                    }

                    // 添加翻译函数依赖
                    {
                        const programPath = path.find((p) => p.isProgram());
                        programPath.unshiftContainer(
                            'body',
                            t.ImportDeclaration(
                                [
                                    t.importDefaultSpecifier(
                                        t.Identifier(functionName)
                                    ),
                                ],
                                t.stringLiteral('koot/i18n/translate')
                            )
                        );
                    }

                    state[BABEL_I18N_MODIFIED] = true;
                }
            },
        },
    };
};
