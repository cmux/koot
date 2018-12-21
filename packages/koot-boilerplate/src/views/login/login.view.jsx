import React, { Component } from 'react';
import classNames from 'classnames';

@KootExtend({
    styles: require('./login.view.less'),
    connect: () => ({})
})
class Login extends Component {
    
    render() {
        const { className } = this.props;
        const classes = classNames([
            className,
        ])
        return (
            <div className={classes}>
                这是登陆页面
            </div>
        );
    }
}

export default Login;
