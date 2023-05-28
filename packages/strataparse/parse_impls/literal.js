import { ParserConfigDSL } from "../dsl/ParserBuilder.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default class LiteralParserImpl {
    static meta = {
        inputs: 'bytes',
        outputs: 'node'
    }
    static createFunction ({ parserFactory }) {
        return (value) => {
            const conf = new ParserConfigDSL(parserFactory, this);
            conf.parseParams({ value });
            return conf;
        };
    }
    constructor ({ value }) {
        // adapt value
        if ( typeof value === 'string' ) {
            value = encoder.encode(value);
        }

        if ( value.length === 0 ) {
            throw new Error(
                'tried to construct a LiteralParser with an ' +
                'empty value, which could cause infinite ' +
                'iteration'
            );
        }

        this.value = value;
    }
    parse (lexer) {
        for ( let i=0 ; i < this.value.length ; i++ ) {
            let { done, value } = lexer.next();
            if ( done ) return;
            if ( this.value[i] !== value ) return;
        }

        const text = decoder.decode(this.value);
        return { $: 'literal', text };
    }
}
