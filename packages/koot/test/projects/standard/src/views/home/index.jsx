import React from 'react'
import { extend } from 'koot'

// export default extend({
//     connect: true,
//     pageinfo: (/*state, renderProps*/) => ({
//         title: __('title'),
//         metas: [
//             { 'description': __('title') },
//             { 'page-name': 'home' },
//         ]
//     }),
//     styles: require('./styles.less'),
// })(
//     ({
//         className
//     }) =>
//         <div className={className}>
//             <h2>123Koot.js</h2>
//         </div>
// )

@extend({
    connect: true,
    pageinfo: (/*state, renderProps*/) => ({
        title: __('title'),
        metas: [
            { 'description': __('title') },
            { 'page-name': 'home' },
        ]
    }),
    styles: require('./styles.less'),
})
class HomePage extends React.Component {
    render() {
        return (
            <div className={this.props.className}>
                <h2>Koot.js</h2>
            </div>
        )
    }
}

export default HomePage
