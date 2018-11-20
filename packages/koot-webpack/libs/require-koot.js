const fs = require('fs')
const path = require('path')

module.exports = (theModule) => {
    try {
        return require(`koot/${theModule}`)
    } catch (e) {
        let file = path.resolve(__dirname, '../../koot', theModule)

        if (fs.existsSync(file))
            return require(file)

        if (fs.existsSync(file + '.js'))
            return require(file + '.js')

        if (fs.existsSync(file + '.jsx'))
            return require(file + '.jsx')
    }
}
