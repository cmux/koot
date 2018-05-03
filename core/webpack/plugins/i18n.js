const ParserHelpers = require("webpack/lib/ParserHelpers");
const ConstDependency = require('webpack/lib/dependencies/ConstDependency')

class I18nPlugin {
    constructor({
        stage = 'client',
        functionName = '__',
        tempObjectName = '__SUPER_I18N_LOCALES__',
    }) {
        this.stage = stage
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
                    const tempFunctionName = '__SUPER_I18N_TRANSLATE__'

                    // 将 functionName 替换为 tempFunctionName
                    let result
                    if (stage === 'client')
                        result = `${tempFunctionName}(${tempObjectName}.${expr.arguments[0].value})`
                    else
                        result = `${tempFunctionName}(${expr.arguments[0].raw})`
                    const dep = new ConstDependency(result, expr.range)
                    dep.loc = expr.loc
                    this.state.current.addDependency(dep)
                    // console.log(result)

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
