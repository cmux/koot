import AppContainer from '../core/AppContainer'

const server = new AppContainer()

// set cookie key

server.app.keys = ['super-project-key']

// add sub apps

server.addSubApp('www', require('../apps/www'))
server.addSubApp('react', require('../apps/react'))

//

server.run(process.env.SERVER_PORT)