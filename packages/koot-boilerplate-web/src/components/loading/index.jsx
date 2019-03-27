import React, { Component } from 'react';
import { extend } from 'koot';
import LoadingImg from './loading.jpg';

class Loading extends Component {
    render() {
        return (
            <div className={this.props.className}>
                <div className="boxbody">
                    <div className="boxLoading">
                        <img src={LoadingImg} alt="loading" />
                    </div>
                    <div className="shadow" />
                </div>
            </div>
        );
    }
}

export default extend({
    styles: require('./styles.module.less'),
})(Loading);
