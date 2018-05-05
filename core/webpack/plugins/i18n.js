const fs = require('fs-extra')
const path = require('path')
const ParserHelpers = require("webpack/lib/ParserHelpers")
const ConstDependency = require('webpack/lib/dependencies/ConstDependency')
const NullFactory = require("webpack/lib/NullFactory")
const DefinePlugin = require("webpack/lib/DefinePlugin")

const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
const clientParse = (exp) =>
    `(() => typeof ${exp} === 'string' ? JSON.parse(${exp}) : ${exp})()`

const parse = ({
    stage,
    tempFunctionName,
    expr,
    parser,
    scope,
    definitions = {},
}) => {
    // stage = 'client'
    // console.log(this)
    // console.log(options)
    // console.log(data)
    // console.log(expr)
    // console.log(expr.arguments)

    // 将 functionName 替换为 tempFunctionName
    let result = `${tempFunctionName}(`
    // let exp = ''
    // if (stage === 'client')
    //     exp += `${tempObjectName}.`
    // else
    //     exp += '`'
    // for (let i = 0; i < expr.arguments.length; i++) {
    //     console.log(i, expr.arguments[i])
    //     const arg = expr.arguments[i]
    //     switch (arg.type) {
    //         case 'Identifier': {
    //             if (stage === 'client') {
    //                 exp = clientParse(exp)
    //                 exp += `[${arg.name}]`
    //             } else
    //                 exp += `.$\{${arg.name}}`
    //             break
    //         }
    //         case 'ObjectExpression': {
    //             break
    //         }
    //         default: {
    //             if (isNumeric(arg.value)) {
    //                 if (stage === 'client') {
    //                     exp = clientParse(exp)
    //                 }
    //                 exp += `[${arg.value}]`
    //             } else {
    //                 exp += (i ? '.' : '') + arg.value
    //             }
    //         }
    //     }
    // }
    // if (stage === 'client') {
    // } else
    //     exp += '`'
    if (stage === 'server') result += '`'

    for (let i = 0; i < expr.arguments.length; i++) {
        // console.log(i, expr.arguments[i])
        const arg = expr.arguments[i]
        switch (arg.type) {
            case 'Identifier': {
                if (stage === 'client') {
                    result += (i ? ',' : '') + `${arg.name}`
                } else {
                    result += `.\` + ${arg.name} + \``
                }
                break
            }
            case 'ObjectExpression': {
                if (i >= expr.arguments.length - 1) {
                    if (stage === 'server') result += '`'
                    result += `,${scope.state.current._source._value.substr(arg.start, arg.end - arg.start)}`
                }
                break
            }
            default: {
                if (stage === 'client') {
                    result += (i ? ',' : '')
                    if (isNumeric(arg.value)) {
                        result += arg.value
                    } else if (i) {
                        result += JSON.stringify(arg.value)
                    } else {
                        const value = (arg.value in definitions)
                            ? definitions[arg.value]
                            : arg.value
                        result += JSON.stringify(value)
                    }
                } else {
                    if (isNumeric(arg.value)) {
                        result += `[${arg.value}]`
                    } else {
                        result += (i ? '.' : '') + arg.value
                    }
                }
            }
        }
    }

    if (stage === 'server') {
        if (expr.arguments[expr.arguments.length - 1].type !== 'ObjectExpression')
            result += '`'
    }

    result += `)`

    // console.log(stage, result)

    const dep = new ConstDependency(result, expr.range)
    dep.loc = expr.loc
    scope.state.current.addDependency(dep)
    // console.log(dep)
    // console.log(expr)

    // require('super-i18n')
    const request = [].concat(['super-i18n', 'default'])
    const nameIdentifier = tempFunctionName
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

        compiler.plugin('compilation', (compilation, data) => {
            data.normalModuleFactory.plugin('parser', (parser, options) => {
                parser.plugin(`call ${functionName}`, function (expr) {
                    return parse({
                        stage,
                        tempFunctionName,
                        // tempObjectName,
                        expr,
                        parser,
                        scope: this,
                        definitions,
                    })
                })
            })
        })

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
