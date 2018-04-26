import superClient from './run'
import {
    locales,
    router,
    redux,
    client,
} from '../../../../super'

export default superClient({
    i18n: !!locales,
    router,
    redux,
    client,
})