function getSourceContent(source) {
    if (typeof source.source === 'function') return source.source();
    if (typeof source.source === 'object')
        return getSourceContent(source.source);

    if (source && Array.isArray(source._children))
        return source._children
            .map((child) => getSourceContent(child))
            .join('\n');

    if (typeof source._value !== 'undefined') return source._value;
    if (typeof source._cachedSource !== 'undefined')
        return source._cachedSource;

    // console.log(source);

    return '';
}

module.exports = getSourceContent;
