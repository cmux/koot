const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const spinner = require('../../utils/spinner')

// const prepareProjects = require('../prepare-projects')
const { dir: dirProjects, projects, commandTestBuild } = require('../projects')
const stages = ['client', 'server']
const envs = ['prod', 'dev']

global.kootTest = true

// beforeAll(async (done) => {
//     await prepareProjects()
//     done()
// })

const run = async () => {
    for (let project of projects) {
        const { name } = project
        const dir = path.resolve(dirProjects, name)

        const stage = 'server'
        const env = 'prod'
        const command = `${commandTestBuild}-${stage}-${env}`

        const pathPackage = path.resolve(dir, 'package.json')
        const p = await fs.readJson(pathPackage)
        if (!p.scripts[command])
            p.scripts[command] = `koot-build --stage ${stage} --env ${env}`
        await fs.writeJson(pathPackage, p, {
            spaces: 4
        })

        // const waitingBuilding = spinner(`${name} [${stage} | ${env}] - 打包中...`)
        const { stdout, stderr } = await exec(
            `npm run ${command}`,
            {
                cwd: dir,
            }
        )
        // waitingBuilding.stop()

        console.log('stdout', stdout)
        console.log('stderr', stderr)
    }
}

run()
