import { AcceptParserUtil, ParseResult, Parser } from "../parse.js";

export default class ContextSwitchingPStratumImpl {
    constructor ({ contexts, entry }) {
        this.contexts = { ...contexts };
        for ( const key in this.contexts ) {
            console.log('parsers?', this.contexts[key]);
            const new_array = [];
            for ( const parser of this.contexts[key] ) {
                if ( parser.hasOwnProperty('transition') ) {
                    new_array.push({
                        ...parser,
                        parser: AcceptParserUtil.adapt(parser.parser),
                    })
                } else {
                    new_array.push(AcceptParserUtil.adapt(parser));
                }
            }
            this.contexts[key] = new_array;
        }
        this.stack = [{
            context_name: entry,
        }];
        this.valid = true;

        this.lastvalue = null;
    }
    get stack_top () {
        console.log('stack top?', this.stack[this.stack.length - 1])
        return this.stack[this.stack.length - 1];
    }
    get current_context () {
        return this.contexts[this.stack_top.context_name];
    }
    next (api) {
        if ( ! this.valid ) return { done: true };
        const lexer = api.delegate;

        const context = this.current_context;
        console.log('context?', context);
        for ( const spec of context ) {
            {
                const { done, value } = lexer.look();
                this.anti_cycle_i = value === this.lastvalue ? (this.anti_cycle_i || 0) + 1 : 0;
                if ( this.anti_cycle_i > 30 ) {
                    throw new Error('infinite loop');
                }
                this.lastvalue = value;
                console.log('last value?', value, done);
                if ( done ) return { done };
            }

            let parser, transition, peek;
            if ( spec.hasOwnProperty('parser') ) {
                ({ parser, transition, peek } = spec);
            } else {
                parser = spec;
            }

            const subLexer = lexer.fork();
            // console.log('spec?', spec);
            const result = parser.parse(subLexer);
            if ( result.status === ParseResult.UNRECOGNIZED ) {
                continue;
            }
            if ( result.status === ParseResult.INVALID ) {
                return { done: true, value: result };
            }
            console.log('RESULT', result, spec)
            if ( ! peek ) lexer.join(subLexer);

            if ( transition ) {
                console.log('GOT A TRANSITION')
                if ( transition.pop ) this.stack.pop();
                if ( transition.to ) this.stack.push({
                    context_name: transition.to,
                });
            }

            if ( result.value.$discard || peek ) return this.next(api);

            console.log('PROVIDING VALUE', result.value);
            return { done: false, value: result.value };
        }

        return { done: true, value: 'ran out of parsers' };
    }
}
