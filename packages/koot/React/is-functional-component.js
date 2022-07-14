/** 给定的组件是否为函数组件 */
function isFunctionalComponent(Component) {
    return (
        typeof Component === 'function' && // can be various things
        !(
            (
                Component.prototype && // native arrows don't have prototypes
                Component.prototype.isReactComponent
            ) // special property
        )
    );
}

export default isFunctionalComponent;
