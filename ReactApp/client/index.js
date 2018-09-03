// import getPathnameProjectConfigFile from '../../utils/get-pathname-project-config-file'

import kootClient from './run'

import {
    router,
    redux,
    client,
} from '__KOOT_PROJECT_CONFIG_PATHNAME__'
// } from '../../../../koot'
// } from '../../.projects/koot-boilerplate/koot'

export default kootClient({
    router,
    redux,
    client,
})
