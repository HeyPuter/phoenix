import { AcceptParserUtil, ParseResult, Parser } from "../parse.js";

export default class FirstRecognizedPStratumImpl {
    static meta = {
        description: `
            Implements a layer of top-down parsing by
            iterating over parsers for higher-level constructs
            and returning the first recognized value that was
            produced from lower-level constructs.
        `
    }
    constructor ({ parsers }) {
        this.parsers = parsers.map(AcceptParserUtil.adapt);
        this.valid = true;
    }
    next (api) {
        if ( ! this.valid ) return { done: true };
        const lexer = api.delegate;

        for ( const parser of this.parsers ) {
            {
                const { done } = lexer.look();
                if ( done ) return { done };
            }

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

        return { done: true, value: 'ran out of parsers' };
    }
}
