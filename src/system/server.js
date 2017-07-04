import AppContainer from '../core/AppContainer'

const server = new AppContainer()
server.run(process.env.SERVER_PORT)