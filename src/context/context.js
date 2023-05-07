export class Context {
    constructor (spec) {
        this.spec = spec;

        this.instance_ = {};
    }

    get constants () {
        if ( this.instance_.hasOwnProperty('constants') ) {
            return this.instance_.constants;
        }

        return this._init_constants();
    }

    get consts () {
        return this.constants;
    }

    _init_constants () {
        this.instance_.constants = {};
        for ( const k in this.spec.constants ) {
            Object.defineProperty(this.instance_.constants, k, {
                value: this.spec.constants[k],
                enumerable: true
            })
        }
        return this.instance_.constants;
    }
}
