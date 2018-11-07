// const prepareProjects = require('./prepare-projects')

const run = async () => {
    // await prepareProjects()
    await require('./projects/init')()
}

run()
