import React from 'react'
import { extend } from 'koot'

export default extend({
    styles: require('./styles.less')
})(
    props => <div {...props} />
)
