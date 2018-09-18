module.exports = (str) => {
    const lastCharacter = str.substr(str.length - 1)
    if (lastCharacter === '/' || lastCharacter === '\\')
        return str
    return str + '/'
}
