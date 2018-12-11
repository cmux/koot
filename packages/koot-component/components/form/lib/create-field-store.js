class FileStore {

    constructor(fileds){
        this.fileds = fileds ||{};

        this.oldFileds = {}

        this.fieldMeta = {}
    }

    setFieldMeta(name, fieldMeta) {
        this.fieldMeta[name] = Object.assign({}, this.fieldMeta[name], fieldMeta);
    }

    getFieldMeta(name){
        return this.fieldMeta[name];
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
