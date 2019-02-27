import React from 'react'
import { extend } from 'koot'

const Center = extend({
    styles: require('./styles.component.less')
})(
    (props) => <div {...props} />
)

export default Center
