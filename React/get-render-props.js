/**
 * 基于 serverProps 返回同构 props
 * @param {Object} serverProps 
 * @return {Object}
 */
const fromServerProps = (serverProps = {}) => {
    return {
        ...serverProps
    }
}

/**
 * 基于组件 props 返回同构 props
 * @param {Object} componentProps 
 * @return {Object}
 */
const fromComponentProps = (componentProps = {}) => {
    return {
        ...componentProps
    }
}

export {
    fromServerProps,
    fromComponentProps,
}
