import React from 'react'
import { extend } from 'koot'

import Center from '@components/center'
import Nav from '@components/nav'


// ----------------------------------------------------------------------------


const App = extend({
    styles: require('./app.component.less')
})(
    ({ className, children, ...props }) => (
        <React.StrictMode>
            <div className={className}>
                <Nav {...props} />
                <Main children={children} />
            </div>
        </React.StrictMode>
    )
)
export default App


// ----------------------------------------------------------------------------


const Main = (props) => (
    <main {...props} />
)
