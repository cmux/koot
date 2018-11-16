import React from 'react'
import { extend } from 'koot'

import {
    updateServerTimestamp,
    resetServerTimestamp
} from '@store/infos/actions'

@extend({
    connect: (state) => ({
        localeId: state.localeId,
        serverTimestamp: state.infos.serverTimestamp,
    }),
    pageinfo: (/*state, renderProps*/) => ({
        title: `${__('pages.extend.title')} - ${__('title')}`,
        metas: [
            { 'description': __('pages.extend.description') },
            { 'page-name': 'extend' },
        ]
    }),
    styles: require('./styles.less'),
    // data: {
    //     fetch: (state, renderProps, dispatch) => (
    //         new Promise(resolve => {
    //             dispatch(updateServerTimestamp())
    //             setTimeout(() => resolve(), 200)
    //         })
    //     ),
    //     check: (state, renderProps) => {
    //         // console.log(renderProps, state)
    //         return !!renderProps.serverTimestamp
    //     }
    // },

    data: (state, renderProps, dispatch) => {
        // 判断目标数据是否存在
        console.log('renderProps.serverTimestamp', renderProps.serverTimestamp)
        console.log('renderProps.loaded', renderProps.loaded)
        if (typeof renderProps.serverTimestamp !== 'undefined') {
            // 如果存在，终止
            return new Promise(resolve => resolve())
        }

        // 如果目标数据不存在，执行获取数据方法
        return new Promise(resolve => {
            dispatch(updateServerTimestamp())
            setTimeout(() => resolve(), 200)
        })
    }
})
class PageExtend extends React.Component {
    reset = false

    componentDidMount() {
        console.log('PageExtend mounted')
        console.log(`> localeId:`, this.props.localeId)

        if (!this.reset && !this.props.serverTimestamp) {
            this.props.dispatch(updateServerTimestamp())
        }
    }

    componentWillUnmount() {
        this.props.dispatch(resetServerTimestamp())
        this.reset = true
    }

    render() {
        if (__SERVER__) console.log('render this.props.loaded', this.props.loaded)
        if (!this.props.loaded)
            return <div>LOADING...</div>

        return (
            <div className={this.props.className}>
                <h2>{__('pages.extend.isomorphic')}</h2>
                <p className="timestamp">Server Time: <strong>{(new Date(this.props.serverTimestamp)).toISOString()}</strong></p>
                <p>{__('pages.extend.isomorphic_content')}</p>
            </div>
        )
    }
}

export default PageExtend
