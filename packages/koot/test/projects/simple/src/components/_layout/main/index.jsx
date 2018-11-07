import React from 'react'
import { extend } from 'koot'

export default extend({
    styles: require('./styles.component.less')
})(
    props => <div {...props} />
)
