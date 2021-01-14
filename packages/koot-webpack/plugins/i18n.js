// const fs = require('fs-extra');
// const path = require('path');
// const {
//     toConstantDependency
// } = require('webpack/lib/javascript/JavascriptParserHelpers');
const {
    addParsedVariableToModule,
    toConstantDependency,
} = require('webpack/lib/javascript/JavascriptParserHelpers');
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const NullFactory = require('webpack/lib/NullFactory');
// const getCwd = require('koot/utils/get-cwd');
const readLocaleFileSync = require('koot/i18n/read-locale-file-sync');

// const addParsedVariableToModule = (parser, name, expression) => {
//     if (!parser.state.current.addVariable) return false;
//     const deps = [];
//     parser.parse(expression, {
//         current: {
//             addDependency: dep => {
//                 dep.userRequest = name;
//                 deps.push(dep);
//             }
//         },
//         module: parser.state.module
//     });
//     parser.state.current.addVariable(name, expression, deps);
//     return true;
// };

class I18nPlugin {
    constructor({
        stage = process.env.WEBPACK_BUILD_STAGE,
        functionName = '__',
        localeId,
        localeFile,
    }) {
        this.stage = stage;
        this.functionName = functionName;
        this.localeId = localeId;

        if (localeFile) {
            this.locales = readLocaleFileSync(localeFile);
        }
    }

    apply(compiler) {
        const stage = this.stage;
        const functionName = this.functionName;
        const definitions = {};

        if (stage === 'client') {
            const loop = (obj, prefix) => {
                for (const _key in obj) {
                    const value = obj[_key];
                    const key = prefix ? `${prefix}.${_key}` : _key;
                    definitions[key] = value;
                    if (typeof value === 'object') {
                        loop(value, key);
                    }
                }
            };
            loop(this.locales);
        }

        compiler.hooks.compilation.tap(
            'I18nPlugin',
            (compilation, { normalModuleFactory }) => {
                const localeId = this.localeId;

                compilation.dependencyFactories.set(
                    ConstDependency,
                    new NullFactory()
                );
                compilation.dependencyTemplates.set(
                    ConstDependency,
                    new ConstDependency.Template()
                );

                const handler = (parser) => {
                    // for (let key in parser.hooks) console.log(key)

                    parser.hooks.call
                        .for(functionName)
                        .tap('I18nPlugin', function (node) {
                            const request = [].concat([
                                'koot/i18n/translate',
                                'default',
                            ]);
                            // const nameIdentifier = tempFunctionName
                            let expression = `require(${JSON.stringify(
                                request[0]
                            )})`;
                            if (request.length > 1) {
                                expression += request
                                    .slice(1)
                                    .map((r) => `[${JSON.stringify(r)}]`)
                                    .join('');
                            }
                            addParsedVariableToModule(
                                parser,
                                functionName,
                                expression
                            );

                            if (
                                Array.isArray(node.arguments) &&
                                node.arguments[0].type === 'Literal'
                            ) {
                                const arg = node.arguments[0];
                                const key = arg.value;
                                const code =
                                    stage === 'client'
                                        ? JSON.stringify(
                                              typeof definitions[key] ===
                                                  'undefined'
                                                  ? key
                                                  : definitions[key]
                                          )
                                        : JSON.stringify(key); //.replace(/\./g, '","')
                                if (
                                    stage === 'client' &&
                                    typeof localeId === 'string' &&
                                    !!localeId &&
                                    node.arguments.length === 1
                                ) {
                                    return toConstantDependency(
                                        parser,
                                        code
                                    )(node);
                                }
                                const dep = new ConstDependency(
                                    code,
                                    arg.range
                                );
                                dep.loc = arg.loc;
                                // console.log({ key, code, dep, node });
                                return parser.state.current.addDependency(dep);
                            }
                        });
                };

                normalModuleFactory.hooks.parser
                    .for('javascript/auto')
                    .tap('I18nPlugin', handler);
                normalModuleFactory.hooks.parser
                    .for('javascript/dynamic')
                    .tap('I18nPlugin', handler);
                normalModuleFactory.hooks.parser
                    .for('javascript/esm')
                    .tap('I18nPlugin', handler);
            }
        );
    }
}

module.exports = I18nPlugin;
