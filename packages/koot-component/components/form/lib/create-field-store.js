class FileStore {
    constructor(fileds){
        this.fileds = fileds;
        this.oldFileds = {}
    }
    
    setFields( fileds ) {
        this.oldFileds = this.fileds;
        this.fileds = Object.assign({}, this.fileds, fileds);
    }

    getFieldValue(name) {
        return this.fileds[name];
    }

    getFieldValues(name) {
        if( name ){
            return this.getFieldValue(name);
        }
        return this.fileds;
    }

    getOldFieldValue(name) {
        return this.oldFileds[name];
    }

    getOldFieldValues(name) {
        if( name ){
            return this.getOldFieldValue(name);
        }
        return this.oldFileds;
    }
}

const createFieldsStore = ( options ) => {
    return new FileStore(options);
}

export default createFieldsStore;
