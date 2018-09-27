const styleMap = {}

export const checkAndWriteIntoHead = () => {
    Object.keys(styleMap).forEach(wrapper => {
        const style = styleMap[wrapper]
        if (style.count > 0) {
            // 配置样式
            if (!document.getElementById(wrapper)) {
                const styleTag = document.createElement('style')
                styleTag.innerHTML = style.css
                styleTag.setAttribute('id', wrapper)
                document.getElementsByTagName('head')[0].appendChild(styleTag)
            }
        } else {
            // 移除样式
            if (document.getElementById(wrapper)) {
                document.getElementById(wrapper).remove()
            }
        }
    })
}

export const append = (style) => {
    if (Array.isArray(style))
        return style.forEach(theStyle => append(theStyle))

    if (!styleMap[style.wrapper]) {
        styleMap[style.wrapper] = {
            css: style.css,
            count: 1
        }
    } else {
        styleMap[style.wrapper].count++
    }

    if (__CLIENT__)
        checkAndWriteIntoHead()
}

export const remove = (style) => {
    if (Array.isArray(style))
        return style.forEach(theStyle => remove(theStyle))

    if (styleMap[style.wrapper]) {
        styleMap[style.wrapper].count--
    }
}

export const get = () => styleMap
