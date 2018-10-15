import React from 'react'
// import { ImportStyleRoot } from 'sp-css-import'

// @ImportStyleRoot()
// class RootComponent extends Component {
//     render() {
//         return (
//             <div>{this.props.children}</div>
//         )
//     }
// }
const RootComponent = ({ children }) =>
    <React.Fragment>{children}</React.Fragment>

export default RootComponent
