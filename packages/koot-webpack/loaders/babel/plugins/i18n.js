const readLocaleFileSync = require('koot/i18n/read-locale-file-sync');

const locales = {};
const definitions = {};

const BABEL_I18N_MODIFIED = Symbol('__KOOT_BABEL_PLUGIN_I18N_MODIFIED_KOOT__');

module.exports = (babel) => {
    const { types: t } = babel;
    return {
        name: 'koot-babel-i18n-plugin',
        visitor: {
            CallExpression: (path, state) => {
                if (path[BABEL_I18N_MODIFIED]) return;

                const _callee = path.node.callee;
                const {
                    opts: { stage, functionName, localeId, localeFile },
                } = state;

                if (
                    functionName &&
                    t.isIdentifier(_callee, { name: functionName })
                ) {
                    const _arguments = path.node.arguments;
                    // console.log('\n \n');
                    // console.log({ path, state });
                    // console.log(path.context, path.scope);
                    // console.log({ _callee, _arguments });

                    if (localeId && !locales[localeId]) {
                        locales[localeId] = readLocaleFileSync(localeFile);
                        definitions[localeId] = {};

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
                        loop(locales[localeId]);
                    }

                    // const thisLocales = locales[localeId];
                    const thisDefinitions =
                        stage === 'client' ? definitions[localeId] : undefined;

                    // console.log(
                    //     0,
                    //     _arguments.length,
                    //     state.filename,
                    //     /_layout\\nav\\index.jsx$/.test(state.filename)
                    // );
                    // 如果有翻译定义对象，替换函数调用中的参数
                    if (
                        thisDefinitions &&
                        Array.isArray(_arguments) &&
                        (t.isStringLiteral(_arguments[0]) ||
                            t.isTemplateLiteral(_arguments[0]))
                    ) {
                        const arg = _arguments[0];
                        const key = t.isTemplateLiteral(_arguments[0])
                            ? arg.quasis.map((n) => n.value.cooked).join('')
                            : arg.value;
                        const code =
                            stage === 'client'
                                ? JSON.stringify(
                                      typeof thisDefinitions[key] ===
                                          'undefined'
                                          ? key
                                          : thisDefinitions[key]
                                  )
                                : JSON.stringify(key); //.replace(/\./g, '","')

                        // console.log(1, { key });
                        // console.log(code);

                        // 如果参数只有一个，替换整个表达式，并跳到下一流程 (此时不需要添加依赖)
                        if (_arguments.length === 1) {
                            // path.replaceWith(
                            //     t.expressionStatement(t.stringLiteral(newValue))
                            // );
                            path.replaceWithSourceString(code);
                            // console.log('\n \n');
                            // console.log(key, path.node);
                            return;
                        }

                        // 如果参数有多个，仅替换第一个参数
                        // path.replaceWith(
                        //     t.callExpression(
                        //         t.identifier(functionName),
                        //         [code].concat(_arguments.slice(1))
                        //     )
                        // );
                        let modified = false;
                        const newSource = `${functionName}(${code}, ${_arguments
                            .slice(1)
                            .map((n) => {
                                if (n.value) return `"${n.value}"`;
                                if (typeof n.start === 'undefined')
                                    modified = true;
                                return state.file.code.substr(
                                    n.start,
                                    n.end - n.start
                                );
                            })
                            .join(',')})`;

                        if (modified) return;

                        path.replaceWithSourceString(newSource);
                        path[BABEL_I18N_MODIFIED] = true;
                        // console.log({
                        //     arguments: _arguments,
                        //     newSource,
                        //     path,
                        // });
                        // console.log({ stage, localeId, thisDefinitions });
                        // console.log({ newSource, newNode: path.node });
                    }

                    // 添加翻译函数依赖
                    if (!state[BABEL_I18N_MODIFIED]) {
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

                        state[BABEL_I18N_MODIFIED] = true;
                    }
                }
            },
        },
    };
};
