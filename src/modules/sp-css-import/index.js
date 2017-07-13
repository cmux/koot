import React, { Component } from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'

/*
ImportStyle         适用于普通组件
ImportStyleRoot     适用于最外层组件
*/

// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
if (__CLIENT__) {
    (function (arr) {
        arr.forEach(function (item) {
            if (item.hasOwnProperty('remove')) {
                return;
            }
            Object.defineProperty(item, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                    this.parentNode.removeChild(this);
                }
            });
        });
    })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
}

class StyleContainer extends Component {

    static contextTypes = {
        appendStyle: PropTypes.func,
        getStyle: PropTypes.func
    }

    render () {
        const styles = this.context.getStyle()

        let styleTagsString = ''
        for(let name in styles){
            let id = name
            let s = removeStyleDot(styles[name].css)
            styleTagsString += `<style id=${id}>${s}</style>`
        }

        return (
            <div id="styleCollection" dangerouslySetInnerHTML={{__html: styleTagsString}}></div>
        )
    }
}

export const ImportStyle = (styles) => (StyleWrappedComponent) => {

    class ImportStyle extends Component {

        static contextTypes = {
            appendStyle: PropTypes.func,
            removeStyle: PropTypes.func
        }

        constructor (props, context) {
            super(props, context)

            this.state = {}
            this.classNameWrapper = []
            this.styles = {}
        }

        componentWillMount () {

            styles = stylesHandleWapperCssLoader(styles)
            styles.forEach((style) => {
                this.classNameWrapper.push(style.wrapper)
            })

            this.context.appendStyle(styles)
        }

        componentWillUnmount () {
            this.context.removeStyle(styles)
        }

        render () {

            const props = {
                ...this.props,
                ...this.state
            }

            return (
                <StyleWrappedComponent {...props} className={this.classNameWrapper.concat(this.props.className).join(' ')}>
                    {this.props.children}
                </StyleWrappedComponent>
            )
        }
    }

    return hoistStatics(ImportStyle, StyleWrappedComponent)
}

export const ImportStyleRoot = () => (StyleWrappedComponent) => {

    class ImportStyleRoot extends Component {

        constructor (props) {
            super(props)

            this.styleMap = {}

            this.checkAndWriteStyleToHeadTag = () => {

                for( let key in this.styleMap){
                    let styleObj = this.styleMap[key]
                    if(styleObj.ref > 0){
                        // 配置样式
                        if(!document.getElementById(key)){
                            let styleTag = document.createElement('style')
                            styleTag.innerHTML = removeStyleDot(styleObj.css)
                            styleTag.setAttribute('id', key)
                            document.getElementsByTagName('head')[0].appendChild(styleTag)
                        }
                    } else {
                        // 移除样式
                        if(document.getElementById(key)){
                            document.getElementById(key).remove()
                        }
                    }
                }
            }
        }


        static childContextTypes = {
            appendStyle: PropTypes.func,
            removeStyle: PropTypes.func,
            getStyle: PropTypes.func
        }

        getChildContext = function () {
            return {
                appendStyle: (styles) => {
                    styles.forEach((style) => {
                        
                        if(!this.styleMap[style.wrapper]){
                            this.styleMap[style.wrapper] = {
                                css: style.css,
                                ref: 1
                            }
                        }else{
                            // 样式引用计数
                            this.styleMap[style.wrapper].ref ++
                        }
                    })

                    __CLIENT__ && this.checkAndWriteStyleToHeadTag()
                },
                removeStyle: (styles) => {
                    styles.forEach((style) => {
                        
                        // 引用计数减少
                        if(this.styleMap[style.wrapper]){
                            this.styleMap[style.wrapper].ref --
                        }

                    })
                },
                getStyle: () => {
                    return this.styleMap
                }
            }
        }

        render () {
            const props = {
                ...this.props,
                ...this.state
            }

            return (
                <StyleWrappedComponent {...props}>
                    {this.props.children}
                    { __SERVER__ && <StyleContainer />}
                </StyleWrappedComponent>
            )
        }
    }

    return ImportStyleRoot
}


// 统一处理，把string,object 都转化成array
const stylesHandleWapperCssLoader = (styles) => {

    // 如果是对象
    if (typeof styles === 'object' && !styles.length) {
        styles = [styles]
    }

    if (typeof styles === 'object' && styles.length) {
        return styles
    }

    throw 'stylesHandleWapperCssLoader() styles type must be array or object'
}

// 删除样式字符前后引号
// const removeStyleDot = (css) => css.substr(1, css.length - 2)
// 新版本的 wapper-style-loader 已经调，不需要做这步处理
const removeStyleDot = (css) => css