export class Parser {
    constructor ({
        impl,
        assign,
    }) {
        this.impl = impl;
        this.assign = assign ?? {};
    }
    parse (lexer) {
        const unadaptedResult = this.impl.parse(lexer);
        const pr = unadaptedResult instanceof ParseResult
            ? unadaptedResult : new ParseResult(unadaptedResult);
        if ( pr.status === ParseResult.VALUE ) {
            pr.value = {
                ...pr.value,
                ...this.assign,
            };
        }
        return pr;
    }
}

export class ParseResult {
    static UNRECOGNIZED = { name: 'unrecognized' };
    static VALUE = { name: 'value' };
    static INVALID = { name: 'invalid' };
    constructor (value, opt_status) {
        if (
            value === ParseResult.UNRECOGNIZED ||
            value === ParseResult.INVALID
        ) {
            this.status = value;
            return;
        }
        this.status = opt_status ?? (
            value === undefined
                ? ParseResult.UNRECOGNIZED
                : ParseResult.VALUE
        );
        this.value = value;
    }
}

class ConcreteSyntaxParserDecorator {
    constructor (delegate) {
        this.delegate = delegate;
    }
    parse (lexer, ...a) {
        const start = lexer.seqNo;
        const result = this.delegate.parse(lexer, ...a);
        if ( result.status === ParseResult.VALUE ) {
            const end = lexer.seqNo;
            result.value.$cst = { start, end };
        }
        return result;
    }
}

export class ParserFactory {
    constructor () {
        this.concrete = false;
    }
    decorate (obj) {
        if ( this.concrete ) {
            obj = new ConcreteSyntaxParserDecorator(obj);
        }

        return obj;
    }
    create (cls, parserParams, resultParams) {
        parserParams = parserParams ?? {};

        resultParams = resultParams ?? {};
        resultParams.assign = resultParams.assign ?? {};
        
        const impl = new cls(parserParams);
        const parser = new Parser({
            impl,
            assign: resultParams.assign
        });
        
        // return parser;
        return this.decorate(parser);
    }
}