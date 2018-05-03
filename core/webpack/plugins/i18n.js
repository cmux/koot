const ParserHelpers = require("webpack/lib/ParserHelpers");
const ConstDependency = require('webpack/lib/dependencies/ConstDependency')

const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
const clientParse = (exp) =>
    `(() => typeof ${exp} === 'string' ? JSON.parse(${exp}) : ${exp})()`

class I18nPlugin {
    constructor({
        stage = 'client',
        functionName = '__',
        tempObjectName = '__SUPER_I18N_LOCALES__',
    }) {
        this.stage = stage
        // this.stage = 'client'
        this.functionName = functionName
        this.tempObjectName = tempObjectName
    }

    apply(compiler) {
        const stage = this.stage
        const functionName = this.functionName
        const tempObjectName = this.tempObjectName
        compiler.plugin('compilation', (compilation, data) => {
            data.normalModuleFactory.plugin('parser', (parser, options) => {
                parser.plugin(`call ${functionName}`, function (expr) {
                    // console.log(this)
                    // console.log(expr)
                    // console.log(expr.arguments)
                    const tempFunctionName = '__SUPER_I18N_TRANSLATE__'

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
                    if (stage === 'client')
                        result += `${tempObjectName}.`
                    else
                        result += '`'
                    for (let i = 0; i < expr.arguments.length; i++) {
                        console.log(i, expr.arguments[i])
                        const arg = expr.arguments[i]
                        switch (arg.type) {
                            case 'Identifier': {
                                if (stage === 'client') {
                                    result += (i ? ',' : '') + `${arg.name}`
                                } else {
                                    result += `[$\{${arg.name}}]`
                                }
                                break
                            }
                            case 'ObjectExpression': {
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
                                        result += arg.value
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
                    if (stage === 'client') {
                    } else
                        result += '`'
                    result += `)`
                    const dep = new ConstDependency(result, expr.range)
                    dep.loc = expr.loc
                    this.state.current.addDependency(dep)
                    console.log(result)

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
                })
            })
        })
    }
}

module.exports = I18nPlugin
