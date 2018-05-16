const fs = require('fs-extra')
const path = require('path')
const ParserHelpers = require("webpack/lib/ParserHelpers")
const ConstDependency = require('webpack/lib/dependencies/ConstDependency')
const NullFactory = require("webpack/lib/NullFactory")


class I18nPlugin {
    constructor({
        stage = process.env.WEBPACK_BUILD_STAGE,
        functionName = '__',
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
    }

    apply(compiler) {
        const stage = this.stage
        const functionName = this.functionName
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
                            const request = [].concat(['super-project/i18n', 'default'])
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
                                const arg = expr.arguments[0]
                                const key = arg.value
                                const code = stage === 'client'
                                    ? JSON.stringify(typeof definitions[key] === 'undefined' ? key : definitions[key])
                                    : JSON.stringify(key)//.replace(/\./g, '","')
                                // console.log(key, code)
                                const dep = new ConstDependency(code, arg.range)
                                dep.loc = arg.loc
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
    }
}

module.exports = I18nPlugin
