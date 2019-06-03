const numberValueFormatter = (value) => {
    const nextValue = parseFloat(value)
    if( nextValue === value ){
        if( nextValue/1000000 >= 1 ){
            return nextValue/1000000 + 'M';
        }
        if( nextValue/1000 >= 1 ){
            return nextValue/1000 + 'K';
        }
    }
    return value;
}

export default numberValueFormatter;
