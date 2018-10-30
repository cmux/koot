import React from 'react'
import { extend } from 'koot'

const Nav = props => (
    <div {...props}>
        <h1 className="logo">Koot.js</h1>
    </div>
)

export default extend({
    styles: require('./styles.less')
})(Nav)
