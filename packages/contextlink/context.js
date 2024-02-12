export class Context {
    constructor (values) {
        for ( const k in values ) this[k] = values[k];
    }
    sub (newValues) {
        if ( newValues === undefined ) newValues = {};
        const sub = Object.create(this);

        const alreadyApplied = {};
        for ( const k in sub ) {
            if ( sub[k] instanceof Context ) {
                const newValuesForK =
                    newValues.hasOwnProperty(k)
                        ? newValues[k] : undefined;
                sub[k] = sub[k].sub(newValuesForK);
                alreadyApplied[k] = true;
            }
        }

        for ( const k in newValues ) {
            if ( alreadyApplied[k] ) continue;
            sub[k] = newValues[k];
        }

        return sub;
    }
}
