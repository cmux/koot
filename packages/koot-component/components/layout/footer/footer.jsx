import React, { Component } from 'react';

@KootExtend({
    styles: require('./footer.module.less'),
})

class Footer extends Component {
    render() {
        return (
            <div className={component}>
                this is footer component
            </div>
        );
    }
}

export default Footer;
