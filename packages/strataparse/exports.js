import { ParserRegistry } from './dsl/ParserRegistry.js';
import { PStratum } from './strata.js';

export {
    Parser,
    ParseResult,
    ParserFactory,
} from './parse.js';

import WhitespaceParserImpl from './parse_impls/whitespace.js';
import LiteralParserImpl from './parse_impls/literal.js';
import StrUntilParserImpl from './parse_impls/StrUntilParserImpl.js';

import {
    SequenceParserImpl,
    ChoiceParserImpl,
    RepeatParserImpl,
    NoneParserImpl,
} from './parse_impls/combinators.js';

export {
    WhitespaceParserImpl,
    LiteralParserImpl,
    SequenceParserImpl,
    ChoiceParserImpl,
    RepeatParserImpl,
    StrUntilParserImpl,
}

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
    default as FirstRecognizedPStratumImpl,
} from './strata_impls/FirstRecognizedPStratumImpl.js';

export {
    default as ContextSwitchingPStratumImpl,
} from './strata_impls/ContextSwitchingPStratumImpl.js';

export { ParserBuilder } from './dsl/ParserBuilder.js';

export class StrataParseFacade {
    static getDefaultParserRegistry() {
        const r = new ParserRegistry();
        r.register('sequence', SequenceParserImpl);
        r.register('choice', ChoiceParserImpl);
        r.register('repeat', RepeatParserImpl);
        r.register('literal', LiteralParserImpl);
        r.register('none', NoneParserImpl);

        return r;
    }
}

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
