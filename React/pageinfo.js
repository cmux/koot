import React from 'react'
// import PropTypes from 'prop-types'
// import { store } from 'super-project/ReactApp'
import { store } from '../'
import hoistStatics from 'hoist-non-react-statics'

let currentMetaTags
let everMounted = false
let nodeCommentEnd

/**
 * @callback funcGetPageInfo
 * @param {Object} state 当前 state
 * @param {Object} ownProps 组件自身的 props
 * @returns {Object}
 */

/**
 * 修改页面 title 和 meta，可用于同构
 * @param {funcGetPageInfo} callback
 */
export default (funcGetPageInfo) => (WrappedComponent) => {
    const getInfo = (store, renderProps) => {
        if (typeof funcGetPageInfo !== 'function') return

        let infos = funcGetPageInfo(store.getState(), renderProps)
        if (typeof infos !== 'object') infos = {}

        return {
            title: infos.title || '',
            metas: infos.metas || []
        }
    }

    class SuperPage extends React.Component {
        // static contextTypes = {
        //     store: PropTypes.object
        // }
        static onServerRenderHtmlExtend = ({ htmlTool, store, renderProps = {} }) => {
            const infos = getInfo(store, renderProps)
            htmlTool.title = infos.title
            htmlTool.metas = infos.metas
        }

        updateInfo() {
            if (__SERVER__) return

            const infos = getInfo(store, this.props)

            // 替换页面标题
            document.title = infos.title

            // 替换 metas
            const head = document.getElementsByTagName('head')[0]
            if (!Array.isArray(currentMetaTags)) {
                currentMetaTags = []
                // 移除所有在 SUPER_METAS 里的 meta 标签
                // 采用 DOM 操作的初衷：如果使用 innerHTML 的字符串替换方法，浏览器可能会全局重新渲染一次，造成“闪屏”
                const childNodes = head.childNodes
                const nodesToRemove = []
                let meetStart = false
                let meetEnd = false
                let i = 0
                while (!meetEnd && childNodes[i] instanceof Node) {
                    const node = childNodes[i]
                    if (node.nodeType === Node.COMMENT_NODE) {
                        if (node.nodeValue === __SUPER_INJECT_METAS_START__)
                            meetStart = true
                        if (node.nodeValue === __SUPER_INJECT_METAS_END__) {
                            meetEnd = true
                            nodeCommentEnd = node
                        }
                    } else if (meetStart && node.nodeType === Node.ELEMENT_NODE && node.tagName === 'META') {
                        nodesToRemove.push(node)
                    }
                    i++
                }
                nodesToRemove.forEach(el => head.removeChild(el))
                /*
                const match = head.innerHTML.match(/<!--SUPER_METAS_START-->(.*?)<!--SUPER_METAS_END-->/g)
                if (Array.isArray(match) && match.length > 0) {
                    const e = document.createElement('html')
                    e.innerHTML = `<html><head>${match[0]}</head></html>`
                    const metas = e.getElementsByTagName('meta')
                    const result = []
                    for (let i = 0; i < metas.length; i++) {
                        const meta = metas[i]
                        let selector = 'meta'
                        for (let j = 0; j < meta.attributes.length; j++) {
                            const attribute = meta.attributes[j]
                            // console.log(attribute.name, attribute.value)
                            selector += `[${attribute.name}="${attribute.value}"]`
                        }
                        // console.log(selector)
                        const els = head.querySelectorAll(selector)
                        for (let j = 0; j < els.length; j++) {
                            result.push(els[j])
                        }
                    }
                    result.forEach(el => el.parentNode.removeChild(el))
                }
                */
                /*
                const exec = /<!--SUPER_METAS_START-->(.*?)<!--SUPER_METAS_END-->/g.exec(head.innerHTML)
                if (Array.isArray(exec) && exec.index) {
                    console.log(exec)
                }
                head.innerHTML = head.innerHTML.replace(
                    /<!--SUPER_METAS_START-->(.*?)<!--SUPER_METAS_END-->/g,
                    `<!--SUPER_METAS_START-->${infos.metas
                        .filter(meta => typeof meta === 'object')
                        .map(meta => {
                            let str = '<meta'
                            for (var key in meta) {
                                str += ` ${key}="${meta[key]}"`
                            }
                            str += '>'
                            return str
                        }).join('')}<!--SUPER_METAS_END-->`
                )
                */
                /*
                head.innerHTML = head.innerHTML.replace(
                    /<!--SUPER_METAS_START-->(.*?)<!--SUPER_METAS_END-->/g,
                    ''
                )
                */
            }

            currentMetaTags.forEach(el => {
                el.parentNode.removeChild(el)
            })
            currentMetaTags = infos.metas
                .filter(meta => typeof meta === 'object')
                .map(meta => {
                    const el = document.createElement('meta')
                    for (var key in meta) {
                        el.setAttribute(key, meta[key])
                    }
                    // el.setAttribute(__SUPER_INJECT_ATTRIBUTE_NAME__, '')
                    if (nodeCommentEnd) {
                        head.insertBefore(el, nodeCommentEnd)
                    } else {
                        head.appendChild(el)
                    }
                    return el
                })
        }

        componentDidUpdate(prevProps) {
            if (typeof prevProps.location === 'object' &&
                typeof this.props.location === 'object' &&
                prevProps.location.pathname !== this.props.location.pathname
            )
                this.updateInfo()
        }

        componentDidMount() {
            if (!everMounted) {
                everMounted = true
                return
            }
            this.updateInfo()
        }

        render = () => <WrappedComponent {...this.props} />
    }

    return hoistStatics(SuperPage, WrappedComponent)
}
