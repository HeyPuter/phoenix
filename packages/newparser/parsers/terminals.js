import { UNRECOGNIZED } from "../lib";

export class Literal extends Parser {
    _create (value) {
        this.value = value;
    }

    _parse (stream) {
        for ( let i=0 ; i < this.value.length ; i++ ) {
            let { done, value } = lexer.next();
            if ( done ) return UNRECOGNIZED;
            if ( this.value[i] !== value ) return;
        }

        return { $: 'literal', value: this.value };
    }
}