import React from 'react'
import { extend } from 'koot'

import {
    updateServerTimestamp,
    resetServerTimestamp
} from '@store/infos/actions'

/**
 * 检查组件数据是否已经准备/读取完毕
 * @param {Object} props 
 * @returns {Boolean}
 */
const checkData = (props) => !!props.serverTimestamp

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
    styles: require('./styles.component.less'),

    // data: {
    //     fetch: (state, renderProps, dispatch) => {
    //         return new Promise(resolve => {
    //             dispatch(updateServerTimestamp())
    //             setTimeout(() => resolve(), 200)
    //         })
    //     },
    //     check: (state, renderProps) => {
    //         // console.log(renderProps, state)
    //         return !!renderProps.serverTimestamp
    //     }
    // },

    data: (state, renderProps, dispatch) => {
        if (checkData(renderProps))
            return true
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
        if (!checkData(this.props))
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
