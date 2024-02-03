import { ParserBuilder, ParserFactory, StrataParseFacade } from "strataparse"

import { PARSE_CONSTANTS } from "./PARSE_CONSTANTS.js";
const escapeSubstitutions = PARSE_CONSTANTS.escapeSubstitutions;

const splitTokens = (items, delimPredicate) => {
    const result = [];
    {
        let buffer = [];
        // single pass to split by pipe token
        for ( let i=0 ; i < items.length ; i++ ) {
            if ( delimPredicate(items[i]) ) {
                result.push(buffer);
                buffer = [];
                continue;
            }

            buffer.push(items[i]);
        }

        if ( buffer.length !== 0 ) {
            result.push(buffer);
        }
    }
    return result;
};

class ReducePrimitivesPStratumImpl {
    next (api) {
        const lexer = api.delegate;

        let { value, done } = lexer.next();

        if ( done ) return { value, done };

        if ( value.$ === 'string' ) {
            const [lQuote, contents, rQuote] = value.results;
            let text = '';
            for ( const item of contents.results ) {
                if ( item.$ === 'string.segment' ) {
                    // console.log('segment?', item.text)
                    text += item.text;
                    continue;
                }
                if ( item.$ === 'string.escape' ) {
                    const [escChar, escValue] = item.results;
                    if ( escValue.$ === 'literal' ) {
                        text += escapeSubstitutions[escValue.text];
                    } // else
                    if ( escValue.$ === 'sequence' ) {
                        // TODO: \u[4],\x[2],\0[3]
                    }
                }
            }

            value.text = text;
            delete value.results;
        }

        return { value, done };
    }
}

class ShellConstructsPStratumImpl {
    static states = (() => {
        const states = [
            {
                name: 'pipeline'
            },
            {
                name: 'command'
            },
            {
                name: 'token',
            },
        ];

        const states_object = {};
        for ( const state of states ) {
            states_object[`STATE_${state.name.toUpperCase()}`] = {
                ...state,
                method_next: `next_${state.name}`,
                method_on_enter: `on_enter_${state.name}`,
                method_on_exit: `on_exit_${state.name}`,
                method_on_return_to: `on_return_to_${state.name}`,
            };
        }
    })();

    constructor () {
        this.states = this.constructor.states;
        this.buffer = [];
        this.stack = [];

        this.push(this.states.STATE_PIPELINE);
    }

    get stack_top () {
        return this.stack[this.stack.length - 1];
    }

    push (state, node) {
        if ( ! node ) node = {};
        this.stack.push({ state, node });
        const method = this[state.method_on_enter];
        if ( method ) {
            method.call(this, { node });
        }
    }

    pop () {
        const { state, node } = this.stack.pop();
        const method = this[state.method_on_exit];
        if ( method ) {
            method.call(this, { node });
        }
    }

    chstate (state) {
        this.stack_top.state = state;
    }

    on_enter_pipeline ({ node }) {
        node.$ = 'pipeline';
        node.commands = [];
        this.push(this.states.STATE_COMMAND, {});
    }

    on_enter_command ({ node }) {
        node.$ = 'command';
        node.tokens = [];
    }

    on_exit_command ({ node }) {
        this.stack_top.node.commands.push(node);
    }

    on_enter_string ({ node }) {
        node.$ = 'string';
        node.children = [];
    }

    next (api) {
        const lexer = api.delegate;

        const { done, value } = lexer.look();
        if ( done ) return { done };

        const state = this.stack_top.state;

        const method = this[state.method_next];
        if ( ! method ) {
            throw new Error(`no method for state ${state.name}`);
        }

        return method.call(this, {
            lexer,
            value,
        });
    }

    next_pipeline ({ lexer, value }) {
        if ( value.$ === 'op.pipe' ) {
            lexer.next();
        }

        this.push(this.states.STATE_COMMAND, {});
    }

    next_command ({ lexer, value }) {
        if ( value.$ === 'whitespace') {
            lexer.next();
            return;
        }

        this.push(this.states.STATE_TOKEN, {});
    }

    next_token ({ lexer, value }) {
        if ( value.$ === 'symbol' ) {
            this.buffer.push(value);
            lexer.next();
            return;
        }

        if ( value.$ === 'string.dquote' ) {
            this.push(this.states.STATE_STRING, { quote: value });
            return;
        }






    consolidateTokens (tokens) {
        const types = tokens.map(token => token.$);

        if ( tokens.length === 0 ) {
            throw new Error('expected some tokens');
        }

        if ( types.includes('op.pipe') ) {
            const components =
                splitTokens(tokens, t => t.$ === 'op.pipe')
                .map(tokens => this.consolidateTokens(tokens));
            
            return { $: 'pipeline', components };
        }
    
        // const command = tokens.shift();
        const args = [];
        const outputRedirects = [];
        const inputRedirects = [];

        const states = {
            STATE_NORMAL: {},
            STATE_REDIRECT: {
                direction: null
            },
        };
        const stack = [];
        let dest = args;
        let state = states.STATE_NORMAL;
        for ( const token of tokens ) {
            if ( state === states.STATE_REDIRECT ) {
                const arry = state.direction === 'out' ?
                    outputRedirects : inputRedirects;
                arry.push({
                    // TODO: get string value only
                    path: token,
                })
                state = states.STATE_NORMAL;
                continue;
            }
            if ( token.$ === 'op.redirect' ) {
                state = states.STATE_REDIRECT;
                state.direction = token.direction;
                continue;
            }
            if ( token.$ === 'op.cmd-subst' ) {
                const new_dest = [];
                dest = new_dest;
                stack.push({
                    $: 'command-substitution',
                    tokens: new_dest,
                });
                continue;
            }
            if ( token.$ === 'op.close' ) {
                const sub = stack.pop();
                dest = stack.length === 0 ? args : stack[stack.length-1].tokens;
                const cmd_node = this.consolidateTokens(sub.tokens);
                dest.push(cmd_node);
                continue;
            }
            dest.push(token);
        }

        const command = args.shift();

        return {
            $: 'command',
            command,
            args,
            inputRedirects,
            outputRedirects,
        };
    }
}

export const buildParserSecondHalf = (sp) => {
    const parserFactory = new ParserFactory();
    const parserRegistry = StrataParseFacade.getDefaultParserRegistry();

    const parserBuilder = new ParserBuilder(
        parserFactory,
        parserRegistry,
    );

    sp.add(new ReducePrimitivesPStratumImpl());
    sp.add(new ShellConstructsPStratumImpl());
}