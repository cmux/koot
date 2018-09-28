/**
 * 基于 serverProps 返回同构 props
 * @param {Object} serverProps 
 * @return {Object}
 */
const fromServerProps = (serverProps = {}) => {
    // console.log(' ')
    // console.log('----------')
    // console.log(serverProps)
    // console.log('----------')
    // console.log(' ')
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
    // console.log(' ')
    // console.log('----------')
    // console.log(componentProps)
    // console.log('----------')
    // console.log(' ')
    return {
        ...componentProps
    }
}

export {
    fromServerProps,
    fromComponentProps,
}
