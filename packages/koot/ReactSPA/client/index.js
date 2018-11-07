import kootClient from './run'
import {
    router,
    redux,
    client,
} from '__KOOT_PROJECT_CONFIG_PATHNAME__'
// } from '../../../../koot'

export default kootClient({
    router,
    redux,
    client,
})
