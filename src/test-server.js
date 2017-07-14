import spServer from './wapper/spServer'

const server = new spServer()

server
    .port(3000)
    .createApp({
        type: 'react-isomorphic',
        domain: ['localhost'],
        // path: './apps/react',
        // srcFolder: '',
        // distFolder: '',

        //

        isomorphic: {
            combineReducer: [
                ['', () => {}]
            ],
            routes: [],
            inject: {

            },
            template: '',
            router: [],
            onServerRender: (koaCtx, reduxStore) => {

            }
        }
    })
    // .createApp({
    //     domain: 'qa.cmcm.cn',
    //     type: 'website',
    //     folder: ''
    // })
    .run()

export { server }