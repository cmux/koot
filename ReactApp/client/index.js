// import getPathnameProjectConfigFile from '../../utils/get-pathname-project-config-file'

import kootClient from './run'

import {
    router,
    redux,
    client,
// } from '../../../../koot'
} from '../../.projects/koot-boilerplate/koot'

export default kootClient({
    router,
    redux,
    client,
})
