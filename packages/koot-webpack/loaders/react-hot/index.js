// modify based on:
// https://github.com/NoamELB/react-hot-loader-loader

function AddReactHotLoader(source) {

    if (!source || !/^\s*export\s+default/m.exec(source))
        return source

    let theSource = getImportLine() + source

    {
        const newSource = require('./transforms/export-default-named-class-component')(theSource)
        if (newSource !== theSource)
            return newSource
    }

    const className = getExportDefaultClassName(source)
    const classNameExported = getExportDefaultClassNameExported(source)
    const functionName = getExportDefaultFunctionName(source)

    if (className) {
        theSource = transformSourceForClass(theSource, className)
    } else if (classNameExported) {
        theSource = transformSourceForClassExported(theSource, classNameExported)
    } else if (functionName) {
        theSource = transformSourceForNamedFunction(theSource, functionName)
    } else if (checkExportClassDirectly(source)) {
        theSource = transformSourceForExportClassDirectly(theSource)
    } else {
        theSource = require('./transforms/export-anonymous-functional-component-with-hoc')(theSource)
        theSource = transformSourceDefault(theSource)
    }

    // console.log(theSource)
    return theSource
}

// transforms

function transformSourceForClass(source, className) {
    // source = source.replace(/^\s*export\s+default\s+/m, '')
    // source += `\nexport default hot(module)(${className});`
    const regex = new RegExp(`^\\s*export\\s+default\\s+class\\s+${className}\\s+`, 'm')
    source = source.replace(regex, `@hot(module)\nexport default class ${className} `)
    return source
}

function transformSourceForClassExported(source, variableName) {
    const regex = new RegExp(`class(\\s+)${variableName}(\\s+)`, 'm')
    source = source.replace(regex, `@hot(module)\nclass$1${variableName}$1`)
    return source
}

function transformSourceForNamedFunction(source, functionName) {
    source = source.replace(/^\s*export\s+default\s+/m, '')
    source += `\nexport default hot(module)(${functionName});`
    return source
}

function transformSourceDefault(source) {
    source = source.replace(/^\s*export\s+default/m, 'const reactAppToMakeSuperHot =')
    source += `\nexport default hot(module)(reactAppToMakeSuperHot);`
    return source
}

function transformSourceForExportClassDirectly(source) {
    source = source.replace(
        /(^|\r|\n)export\s+default\s+class\s+/,
        `$1@hot(module)\nexport default class `
    )
    return source
}

// getters

function getImportLine() {
    return `import {hot} from 'react-hot-loader';\n`
}

function getExportDefaultClassName(source) {
    let className = ''
    const matches = source.match(/^\s*export\s+default\s+class\s+(.*?)\s+/m)
    if (matches && matches[1] && matches[1] !== 'extends') {
        className = matches[1]
    }
    return className
}

function getExportDefaultFunctionName(source) {
    let functionName = ''
    const matches = source.match(/^\s*export\s+default\s+function\s+([^(\s^;]*)\s?\(/m)
    if (matches && matches[1]) {
        functionName = matches[1]
    }
    return functionName
}

function getExportDefaultClassNameExported(source) {
    let className = ''
    const matches = source.match(/^\s*export\s+default\s+([^(\s^;]*)[;]*(\n|$)/m)
    if (matches && matches[1]) {
        className = matches[1]
    }
    if (!className)
        return className

    if ((new RegExp(`class\\s+${className}\\s+`, 'm')).test(source))
        return className

    return ''
}

// checkers

function checkExportClassDirectly(source) {
    return /(^|\r|\n)export\s+default\s+class\s+/.test(source)
}

//

module.exports = AddReactHotLoader
