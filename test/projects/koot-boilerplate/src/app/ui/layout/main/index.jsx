import React from 'react'
// import { connect } from 'react-redux'
import { ImportStyle } from 'sp-css-import'

export default ImportStyle(require('./styles.less'))((props) => (
    <div {...props} />
))
