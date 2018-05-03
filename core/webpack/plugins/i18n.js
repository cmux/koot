const ParserHelpers = require("webpack/lib/ParserHelpers");
const ConstDependency = require('webpack/lib/dependencies/ConstDependency')

class I18nPlugin {
    constructor(stage = 'client') {
        this.stage = stage
    }

    apply(compiler) {
        const stage = this.stage
        compiler.plugin('compilation', (compilation, data) => {
            data.normalModuleFactory.plugin('parser', (parser, options) => {
                parser.plugin(`call __`, function (expr) {
                    // console.log(this)
                    // console.log(expr)
                    const funcName = '__SUPER_I18N__'

                    let result
                    if (stage === 'client')
                        result = `${funcName}(L.${expr.arguments[0].value})`
                    else
                        result = `${funcName}(${expr.arguments[0].raw})`
                    const dep = new ConstDependency(result, expr.range)
                    dep.loc = expr.loc
                    this.state.current.addDependency(dep)
                    // console.log(result)

                    // require('super-i18n')
                    let request = [].concat(['super-i18n', 'default'])
                    let nameIdentifier = funcName
                    let expression = `require(${JSON.stringify(request[0])})`
                    if (request.length > 1) {
                        expression += request
                            .slice(1)
                            .map(r => `[${JSON.stringify(r)}]`)
                            .join("");
                    }
                    // console.log(nameIdentifier, expression)
                    if (
                        !ParserHelpers.addParsedVariableToModule(
                            parser,
                            nameIdentifier,
                            expression
                        )
                    ) {
                        return true
                    }
                    return true
                })
            })
        })
    }
}

module.exports = I18nPlugin
