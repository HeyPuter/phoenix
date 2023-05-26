import { PStratum } from './strata.js';

export {
    Parser,
    ParseResult,
    ParserFactory,
} from './parse.js';

export { default as WhitespaceParserImpl } from './parse_impls/whitespace.js';
export { default as LiteralParserImpl } from './parse_impls/literal.js';

export {
    PStratum,
    TerminalPStratumImplType,
    DelegatingPStratumImplType,
} from './strata.js';

export {
    BytesPStratumImpl,
    StringPStratumImpl
} from './strata_impls/terminals.js';

export {
    FirstRecognizedPStratumImpl,
} from './strata_impls/logical.js';

export class StrataParser {
    constructor () {
        this.strata = [];
        this.error = null;
    }
    add (stratum) {
        if ( ! ( stratum instanceof PStratum ) ) {
            stratum = new PStratum(stratum);
        }

        // TODO: verify that terminals don't delegate
        // TODO: verify the delegating strata delegate
        if ( this.strata.length > 0 ) {
            const delegate = this.strata[this.strata.length - 1];
            stratum.setDelegate(delegate);
        }

        this.strata.push(stratum);
    }
    next () {
        return this.strata[this.strata.length - 1].next();
    }
    parse () {
        let done, value;
        const result = [];
        for ( ;; ) {
            ({ done, value } =
                this.strata[this.strata.length - 1].next());
            if ( done ) break
            result.push(value);
        }
        if ( value ) {
            this.error = value;
        }
        return result;
    }
}
