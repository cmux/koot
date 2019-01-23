export const separatorFormat = (num, symbol) => {
    symbol = symbol || ',';
    return num && num.toString().replace(/\d+/, function (s) {
        return s.replace(/(\d)(?=(\d{3})+$)/g, '$1' + symbol)
    })
}

export const ellipsisStyleFormat  = (value) => {
    if( value ){
        if( parseInt(value) != value ){
            value = 1
        }
        return {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: parseInt(value),
            margin: '0',
        }
    }
    return null;
}

export const minWidthStyleFormat  = ( minWidth ) => {
    if( !minWidth ){
        return {}
    }
    const isNumber = parseFloat(minWidth) === minWidth;
    if( !isNumber && typeof minWidth !== 'string'){
        return {}
    }
    const value = isNumber ? minWidth + 'px' : minWidth;
    return {
        minWidth: value
    }
}

export const maxWidthStyleFormat  = ( maxWidth ) => {
    if( !maxWidth ){
        return {}
    }
    const isNumber = parseFloat(maxWidth) === maxWidth;
    if( !isNumber && typeof maxWidth !== 'string'){
        return {}
    }
    const value = isNumber ? maxWidth + 'px' : maxWidth;
    return {
        maxWidth: value
    }

}