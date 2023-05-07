export class AbstractContext {
    get constants () {
        return this.instance_.constants;
    }
    get consts () {
        return this.constants;
    }
    get variables () {
        return this.instance_.valuesAccessor;
    }
    get vars () {
        return this.variables;
    }
}

// export class SubContext extends AbstractContext {
//     constructor ({ parent, changes }) {
//         for ( const k in parent.spec )
//     }
// }

export class Context extends AbstractContext {
    constructor (spec) {
        super();
        this.spec = { ...spec };

        this.instance_ = {};

        if ( ! spec.constants ) spec.constants = {};

        const constants = {};
        for ( const k in this.spec.constants ) {
            Object.defineProperty(constants, k, {
                value: this.spec.constants[k],
                enumerable: true
            })
        }
        this.instance_.constants = constants;

        // const values = {};
        // for ( const k in this.spec.variables ) {
        //     Object.defineProperty(values, k, {
        //         value: this.spec.variables[k],
        //         enumerable: true,
        //         writable: true
        //     });
        // }
        // this.instance_.values = values;
    }
}
