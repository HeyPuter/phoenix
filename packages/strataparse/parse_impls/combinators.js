import { ParserConfigDSL } from "../dsl/ParserBuilder.js";
import { AcceptParserUtil, Parser, ParseResult } from "../parse.js";

export class SequenceParserImpl {
    static createFunction ({ parserFactory }) {
        return (...parsers) => {
            const conf = new ParserConfigDSL(parserFactory, this);
            conf.parseParams({ parsers });
            return conf;
        };
    }
    constructor ({ parsers }) {
        this.parsers = parsers.map(AcceptParserUtil.adapt);
    }
    parse (lexer) {
        const results = [];
        for ( const parser of this.parsers ) {
            const subLexer = lexer.fork();
            const result = parser.parse(subLexer);
            if ( result.status === ParseResult.UNRECOGNIZED ) {
                return;
            }
            if ( result.status === ParseResult.INVALID ) {
                // TODO: this is wrong
                return { done: true, value: result };
            }
            lexer.join(subLexer);
            results.push(result.value);
        }

        return { $: 'sequence', results };
    }
}

export class ChoiceParserImpl {
    static createFunction ({ parserFactory }) {
        return (...parsers) => {
            const conf = new ParserConfigDSL(parserFactory, this);
            conf.parseParams({ parsers });
            return conf;
        };
    }
    constructor ({ parsers }) {
        this.parsers = parsers.map(AcceptParserUtil.adapt);
    }
    parse (lexer) {
        for ( const parser of this.parsers ) {
            const subLexer = lexer.fork();
            const result = parser.parse(subLexer);
            if ( result.status === ParseResult.UNRECOGNIZED ) {
                continue;
            }
            if ( result.status === ParseResult.INVALID ) {
                // TODO: this is wrong
                return { done: true, value: result };
            }
            lexer.join(subLexer);
            return result.value;
        }

        return;
    }
}

export class RepeatParserImpl {
    static createFunction ({ parserFactory }) {
        return (delegate) => {
            const conf = new ParserConfigDSL(parserFactory, this);
            conf.parseParams({ delegate });
            return conf;
        };
    }
    constructor ({ delegate }) {
        delegate = AcceptParserUtil.adapt(delegate);
        this.delegate = delegate;
    }

    parse (lexer) {
        const results = [];
        for ( ;; ) {
            const subLexer = lexer.fork();
            const result = this.delegate.parse(subLexer);
            if ( result.status === ParseResult.UNRECOGNIZED ) {
                break;
            }
            if ( result.status === ParseResult.INVALID ) {
                return { done: true, value: result };
            }
            lexer.join(subLexer);
            results.push(result.value);
        }

        return { $: 'repeat', results };
    }
}

export class NoneParserImpl {
    static createFunction ({ parserFactory }) {
        return () => {
            const conf = new ParserConfigDSL(parserFactory, this);
            return conf;
        };
    }
    parse () {
        return { $: 'none', $discard: true };
    }
}
