const fs = require('fs-extra')
const path = require('path')
const ParserHelpers = require("webpack/lib/ParserHelpers")
const ConstDependency = require('webpack/lib/dependencies/ConstDependency')
const NullFactory = require("webpack/lib/NullFactory")
const BasicEvaluatedExpression = require("webpack/lib/BasicEvaluatedExpression");
// const DefinePlugin = require("webpack/lib/DefinePlugin")

const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
const clientParse = (exp) =>
    `(() => typeof ${exp} === 'string' ? JSON.parse(${exp}) : ${exp})()`

const parse = ({
    stage,
    tempFunctionName,
    functionName,
    expr,
    parser,
    scope = this,
    definitions = {},
}) => {
    // stage = 'client'
    // console.log(this)
    // console.log(options)
    // console.log(data)
    // console.log(expr)
    // console.log(expr.arguments)

    // 将 functionName 替换为 tempFunctionName
    // let result = `${tempFunctionName}(`
    // if (stage === 'server') result += '`'

    // for (let i = 0; i < expr.arguments.length; i++) {
    //     // console.log(i, expr.arguments[i])
    //     const arg = expr.arguments[i]
    //     switch (arg.type) {
    //         case 'Identifier': {
    //             // if (typeof arg.name === 'undefined')
    //             //     console.log(arg)
    //             if (stage === 'client') {
    //                 result += (i ? ',' : '') + `${arg.name}`
    //             } else {
    //                 result += `.\` + ${arg.name} + \``
    //             }
    //             break
    //         }
    //         case 'MemberExpression': {
    //             const code = scope.state.current._source._value.substr(arg.start, arg.end - arg.start)
    //             console.log(parser.walkMemberExpression(arg))
    //             console.log(new BasicEvaluatedExpression())
    //             console.log(code)
    //             // console.log(scope.getNameForExpression(arg).name)
    //             // console.log(new ConstDependency(code, arg.range))
    //             // // console.log(ParserHelpers.toConstantDependency(parser, code))
    //             // const dep = new ConstDependency(code, arg.range)
    //             // dep.loc = arg.loc
    //             // this.state.current.addDependency(dep)
    //             // console.log(dep)
    //             if (stage === 'server') result += '`'
    //             result += `,${code}`
    //             break
    //         }
    //         case 'ObjectExpression': {
    //             // console.log(arg)
    //             // console.log(scope.evaluateExpression(arg))
    //             // console.log('scope')
    //             // for (let key in scope.scope) {
    //             //     // if (ignore.includes(key)) continue
    //             //     console.log(`  ${key}`)
    //             //     const next = scope.scope[key]
    //             //     for (let key in next) {
    //             //         console.log(`    ${key}`)
    //             //     }
    //             // }
    //             // console.log('state')
    //             // for (let key in scope.state) {
    //             //     // if (ignore.includes(key)) continue
    //             //     console.log(`  ${key}`)
    //             //     const next = scope.state[key]
    //             //     for (let key in next) {
    //             //         console.log(`    ${key}`)
    //             //     }
    //             // }
    //             // console.log(scope.state.current._source._value.substr(arg.start, arg.end - arg.start))
    //             // console.log(''.padEnd(50, '='))
    //             if (i >= expr.arguments.length - 1) {
    //                 if (stage === 'server') result += '`'
    //                 result += `,${scope.state.current._source._value.substr(arg.start, arg.end - arg.start)}`
    //             }
    //             break
    //         }
    //         default: {
    //             if (stage === 'client') {
    //                 result += (i ? ',' : '')
    //                 if (isNumeric(arg.value)) {
    //                     result += arg.value
    //                 } else if (i) {
    //                     result += JSON.stringify(arg.value)
    //                 } else {
    //                     const value = (arg.value in definitions)
    //                         ? definitions[arg.value]
    //                         : arg.value
    //                     result += JSON.stringify(value)
    //                 }
    //             } else {
    //                 // if (typeof arg.value === 'undefined')
    //                 //     console.log(arg)
    //                 if (isNumeric(arg.value)) {
    //                     result += `[${arg.value}]`
    //                 } else {
    //                     result += (i ? '.' : '') + arg.value
    //                 }
    //             }
    //         }
    //     }
    // }

    // if (stage === 'server') {
    //     if (
    //         expr.arguments[expr.arguments.length - 1].type !== 'MemberExpression' &&
    //         expr.arguments[expr.arguments.length - 1].type !== 'ObjectExpression'
    //     )
    //         result += '`'
    // }

    // result += `)`

    // // console.log(stage, result)

    // const dep = new ConstDependency(result, expr.range)
    // dep.loc = expr.loc
    // scope.state.current.addDependency(dep)
    // // console.log(dep)
    // // console.log(expr)

    // require('super-i18n')
    const request = [].concat(['super-i18n', 'default'])
    // const nameIdentifier = tempFunctionName
    const nameIdentifier = functionName
    let expression = `require(${JSON.stringify(request[0])})`
    if (request.length > 1) {
        expression += request
            .slice(1)
            .map(r => `[${JSON.stringify(r)}]`)
            .join("");
    }
    ParserHelpers.addParsedVariableToModule(
        parser,
        nameIdentifier,
        expression
    )
    return true
}

class I18nPlugin {
    constructor({
        stage = process.env.WEBPACK_BUILD_STAGE,
        functionName = '__',
        // tempObjectName = '__SUPER_I18N_LOCALES__',
        localeId,
        locales = {},
    }) {
        this.stage = stage
        // this.stage = 'client'
        this.functionName = functionName
        this.localeId = localeId
        this.locales = locales

        if (typeof locales === 'string' && locales.substr(0, 2) === './')
            this.locales = fs.readJsonSync(path.resolve(process.cwd(), locales))
        // this.tempObjectName = tempObjectName
    }

    apply(compiler) {
        const stage = this.stage
        const functionName = this.functionName
        // const tempObjectName = this.tempObjectName
        const tempFunctionName = '__SUPER_I18N_TRANSLATE__'
        const definitions = {}

        if (stage == 'client') {
            const loop = (obj, prefix) => {
                for (let _key in obj) {
                    const value = obj[_key]
                    const key = prefix ? `${prefix}.${_key}` : _key
                    definitions[key] = value
                    if (typeof value === 'object') {
                        loop(value, key)
                    }
                }
            }
            loop(this.locales)
        }
        // console.log(definitions)

        compiler.hooks.compilation.tap(
            "I18nPlugin",
            (compilation, { normalModuleFactory }) => {
                compilation.dependencyFactories.set(ConstDependency, new NullFactory())
                compilation.dependencyTemplates.set(
                    ConstDependency,
                    new ConstDependency.Template()
                )

                const handler = parser => {
                    // for (let key in parser.hooks) console.log(key)

                    parser.hooks.call
                        .for(functionName)
                        .tap("I18nPlugin", function (expr) {
                            const request = [].concat(['super-i18n', 'default'])
                            // const nameIdentifier = tempFunctionName
                            let expression = `require(${JSON.stringify(request[0])})`
                            if (request.length > 1) {
                                expression += request
                                    .slice(1)
                                    .map(r => `[${JSON.stringify(r)}]`)
                                    .join("");
                            }
                            ParserHelpers.addParsedVariableToModule(
                                parser,
                                functionName,
                                expression
                            )

                            if (Array.isArray(expr.arguments) && expr.arguments[0].type === 'Literal') {
                                const key = expr.arguments[0].value
                                const code = stage === 'client'
                                    ? JSON.stringify(definitions[key])
                                    : JSON.stringify(key).replace(/\./g, '","')
                                const dep = new ConstDependency(code, expr.range)
                                dep.loc = expr.loc;
                                return parser.state.current.addDependency(dep)
                            }
                        })
                }

                normalModuleFactory.hooks.parser
                    .for("javascript/auto")
                    .tap("I18nPlugin", handler)
                normalModuleFactory.hooks.parser
                    .for("javascript/dynamic")
                    .tap("I18nPlugin", handler)
                normalModuleFactory.hooks.parser
                    .for("javascript/esm")
                    .tap("I18nPlugin", handler)
            }
        )


        // compiler.plugin('compilation', (compilation, { normalModuleFactory }) => {
        //     compilation.dependencyFactories.set(ConstDependency, new NullFactory())
        //     compilation.dependencyTemplates.set(
        //         ConstDependency,
        //         new ConstDependency.Template()
        //     )
        //     // console.log(data.normalModuleFactory.hooks)
        //     // for (let key in normalModuleFactory.hooks) {
        //     //     console.log(key)
        //     // }
        //     // normalModuleFactory.plugin('parser', (...args) => {
        //     //     console.log(args)
        //     // })
        //     // return true
        //     normalModuleFactory.plugin('parser', (parser, options) => {
        //         parser.plugin(`call ${functionName}`, function (expr) {
        //             return parse({
        //                 stage,
        //                 tempFunctionName,
        //                 functionName,
        //                 // tempObjectName,
        //                 expr,
        //                 parser,
        //                 scope: this,
        //                 definitions,
        //             })
        //         })
        //     })
        // })

        // if (stage === 'client') {
        //     const definePlugin = new DefinePlugin({
        //         '__SUPER_I18N_LOCALES__.header.nav': '啊啊啊',
        //         '__SUPER_I18N_LOCALES__.nav.home': '123',
        //     })
        //     definePlugin.apply(compiler)
        // }
    }
}

module.exports = I18nPlugin
