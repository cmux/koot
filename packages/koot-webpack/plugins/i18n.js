// const fs = require('fs-extra');
// const path = require('path');
// const {
//     toConstantDependency
// } = require('webpack/lib/javascript/JavascriptParserHelpers');
const {
    // addParsedVariableToModule,
    toConstantDependency,
} = require('webpack/lib/javascript/JavascriptParserHelpers');
const CachedConstDependency = require('webpack/lib/dependencies/CachedConstDependency');
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');
const NullDependency = require('webpack/lib/dependencies/NullDependency');
const NullFactory = require('webpack/lib/NullFactory');
const InitFragment = require('webpack/lib/InitFragment');
const makeSerializable = require('webpack/lib/util/makeSerializable');
const HarmonyImportSpecifierDependency = require('webpack/lib/dependencies/HarmonyImportSpecifierDependency');
// const getCwd = require('koot/utils/get-cwd');
const readLocaleFileSync = require('koot/i18n/read-locale-file-sync');
const { sources } = require('webpack');

const I18nFunctionDependency = require('../libs/dependencies/I18nFunctionDependency');
const getSourceContent = require('../libs/get-source-content');

const I18N_DEPENDENCY_ADDED = 'I18N_DEPENDENCY_ADDED';

const addParsedVariableToModule = (parser, name, expression) => {
    if (!parser.state.current.addVariable) return false;
    const deps = [];
    parser.parse(expression, {
        current: {
            addDependency: (dep) => {
                dep.userRequest = name;
                deps.push(dep);
            },
        },
        module: parser.state.module,
    });
    parser.state.current.addVariable(name, expression, deps);
    return true;
};

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
                // compilation.dependencyTemplates.set(
                //     ConstDependency,
                //     new ConstDependency.Template()
                // );
                compilation.dependencyTemplates.set(
                    ConstDependency,
                    new ConstDependency.Template()
                );
                // compilation.dependencyTemplates.set(
                //     CachedConstDependency,
                //     new I18nFunctionDependency.Template(functionName)
                // );

                const handler = (parser) => {
                    // for (let key in parser.hooks) console.log(key)

                    parser.hooks.call
                        .for(functionName)
                        .tap('I18nPlugin', function (node) {
                            // const expression = `import ${functionName} from 'koot/i18n/translate';\n`;
                            // [
                            //     'hooks',
                            //     'sourceType',
                            //     'scope',
                            //     'state',
                            //     'comments',
                            //     'semicolons',
                            //     'statementPath',
                            //     'prevStatement',
                            //     'currentTagData'
                            //   ]
                            // console.log(node);
                            // console.log(Object.keys(parser.state));
                            // [
                            //     'current',
                            //     'module',
                            //     'compilation',
                            //     'options',
                            //     'lastHarmonyImportOrder'
                            //   ]
                            // console.log(Object.keys(parser.state.current));
                            // [
                            //     'dependencies',
                            //     'blocks',
                            //     'type',
                            //     'context',
                            //     'layer',
                            //     'needId',
                            //     'debugId',
                            //     'resolveOptions',
                            //     'factoryMeta',
                            //     'useSourceMap',
                            //     'useSimpleSourceMap',
                            //     '_warnings',
                            //     '_errors',
                            //     'buildMeta',
                            //     'buildInfo',
                            //     'presentationalDependencies',
                            //     'request',
                            //     'userRequest',
                            //     'rawRequest',
                            //     'binary',
                            //     'parser',
                            //     'generator',
                            //     'resource',
                            //     'matchResource',
                            //     'loaders',
                            //     'error',
                            //     '_source',
                            //     '_sourceSizes',
                            //     '_lastSuccessfulBuildMeta',
                            //     '_forceBuild',
                            //     '_isEvaluatingSideEffects',
                            //     '_addedSideEffectsBailout',
                            //     '_ast'
                            //   ]
                            // console.log(
                            //     typeof parser.state.current.addDependency
                            // );
                            // console.log(parser.state.current._source);
                            // if (!parser.state.current[I18N_DEPENDENCY_ADDED]) {
                            //     parser.state.current._source = new sources.RawSource(
                            //         `import ${functionName} from 'koot/i18n/translate';\n` +
                            //             getSourceContent(
                            //                 parser.state.current._source
                            //             ),
                            //         false
                            //     );
                            //     parser.state.current[
                            //         I18N_DEPENDENCY_ADDED
                            //     ] = true;
                            // }
                            // const request = [].concat([
                            //     'koot/i18n/translate',
                            //     'default',
                            // ]);
                            // let expression = `require(${JSON.stringify(
                            //     request[0]
                            // )})`;
                            // if (request.length > 1) {
                            //     expression += request
                            //         .slice(1)
                            //         .map((r) => `[${JSON.stringify(r)}]`)
                            //         .join('');
                            // }

                            if (!parser.state.current[I18N_DEPENDENCY_ADDED]) {
                                // parser.state.current._source.insert(
                                //     0,
                                //     `import ${functionName} from 'koot/i18n/translate';\n`
                                // );
                                parser.state.current[
                                    I18N_DEPENDENCY_ADDED
                                ] = true;
                            }

                            // addParsedVariableToModule(
                            //     parser,
                            //     functionName,
                            //     expression
                            // );
                            // console.log({ expression });

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
