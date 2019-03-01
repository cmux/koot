import React from 'react'
import { extend } from 'koot'

const Icon = extend({
    styles: require('./styles.component.less')
})(
    ({ className, style, icon, ...props }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className={className}
            style={style}
            {...props}
        >
            <use xlinkHref={'#icon-' + icon}></use>
        </svg>
    )
)

export default Icon
