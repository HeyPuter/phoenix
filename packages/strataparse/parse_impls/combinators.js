import { Parser, ParseResult } from "../parse.js";

export class SequenceParserImpl {
    constructor ({ parsers }) {
        this.parsers = parsers.map(parser => {
            if ( ! (parser instanceof Parser) ) {
                return new Parser({ impl: parser });
            }
            return parser;
        });
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
                return { done: true, value: result };
            }
            lexer.join(subLexer);
            results.push(result.value);
        }

        return { $: 'sequence', results };
    }
}

export class ChoiceParserImpl {
    constructor ({ parsers }) {
        this.parsers = parsers.map(parser => {
            if ( ! (parser instanceof Parser) ) {
                return new Parser({ impl: parser });
            }
            return parser;
        });
    }
    parse (lexer) {
        for ( const parser of this.parsers ) {
            const subLexer = lexer.fork();
            const result = parser.parse(subLexer);
            if ( result.status === ParseResult.UNRECOGNIZED ) {
                continue;
            }
            if ( result.status === ParseResult.INVALID ) {
                return { done: true, value: result };
            }
            lexer.join(subLexer);
            return { done: false, value: result.value };
        }

        return;
    }
}

export class RepeatParserImpl {
    constructor ({ delegate }) {
        if ( ! (delegate instanceof Parser) ) {
            delegate = new Parser({ impl: delegate });
        }
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
