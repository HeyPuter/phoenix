import { FirstRecognizedPStratumImpl, ParserBuilder, ParserFactory, StrUntilParserImpl, StrataParseFacade, WhitespaceParserImpl } from "strataparse";
import { UnquotedTokenParserImpl } from "./UnquotedTokenParserImpl.js";
import { PARSE_CONSTANTS } from "./PARSE_CONSTANTS.js";
import { MergeWhitespacePStratumImpl } from "strataparse/strata_impls/MergeWhitespacePStratumImpl.js";
import ContextSwitchingPStratumImpl from "strataparse/strata_impls/ContextSwitchingPStratumImpl.js";

const parserConfigProfiles = {
    syntaxHighlighting: { cst: true },
    interpreting: { cst: false }
};

const list_ws = [' ', '\n', '\t'];
const list_quot = [`"`, `'`];
const list_stoptoken = [
    '|','>','<','&','\\','#',';','(',')',
    ...list_ws,
    ...list_quot
];

export const buildParserFirstHalf = (sp, profile) => {
    const options = profile ? parserConfigProfiles[profile]
        : { cst: false };

    const parserFactory = new ParserFactory();
    if ( options.cst ) {
        parserFactory.concrete = true;
        parserFactory.rememberSource = true;
    }

    const parserRegistry = StrataParseFacade.getDefaultParserRegistry();

    const parserBuilder = new ParserBuilder({
        parserFactory,
        parserRegistry,
    });


    // TODO: unquoted tokens will actually need to be parsed in
    // segments to because `$(echo "la")h` works in sh
    const buildStringParserDef = quote => {
        return a => a.sequence(
            a.literal(quote),
            a.repeat(a.choice(
                // TODO: replace this with proper parser
                parserFactory.create(StrUntilParserImpl, {
                    stopChars: ['\\', quote],
                }, { assign: { $: 'string.segment' } }),
                a.sequence(
                    a.literal('\\'),
                    a.choice(
                        a.literal(quote),
                        ...Object.keys(
                            PARSE_CONSTANTS.escapeSubstitutions
                        ).map(chr => a.literal(chr))
                        // TODO: \u[4],\x[2],\0[3]
                    )
                ).assign({ $: 'string.escape' })
            )),
            a.literal(quote),
        ).assign({ $: 'string' })
    };


    const buildStringContext = quote => [
        parserFactory.create(StrUntilParserImpl, {
            stopChars: ['\\', "$", quote],
        }, { assign: { $: 'string.segment' } }),
        parserBuilder.def(a => a.sequence(
            a.literal('\\'),
            a.choice(
                a.literal(quote),
                ...Object.keys(
                    PARSE_CONSTANTS.escapeSubstitutions
                ).map(chr => a.literal(chr))
                // TODO: \u[4],\x[2],\0[3]
            )
        ).assign({ $: 'string.escape' })),
        {
            parser: parserBuilder.def(a => a.literal(quote)),
            transition: { pop: true }
        },
        {
            parser: parserBuilder.def(a => {
                return a.literal('$(').assign({ $: 'op.cmd-subst' })
            }),
            transition: {
                to: 'command',
            }
        },
    ];

    // sp.add(
    //     new FirstRecognizedPStratumImpl({
    //         parsers: [
    //             parserFactory.create(WhitespaceParserImpl),
    //             parserBuilder.def(a => a.literal('|').assign({ $: 'op.pipe' })),
    //             parserBuilder.def(a => a.literal('>').assign({ $: 'op.redirect', direction: 'out' })),
    //             parserBuilder.def(a => a.literal('<').assign({ $: 'op.redirect', direction: 'in' })),
    //             parserBuilder.def(a => a.literal('$((').assign({ $: 'op.arithmetic' })),
    //             parserBuilder.def(a => a.literal('$(').assign({ $: 'op.cmd-subst' })),
    //             parserBuilder.def(a => a.literal(')').assign({ $: 'op.close' })),
    //             parserFactory.create(StrUntilParserImpl, {
    //                 stopChars: list_stoptoken,
    //             }, { assign: { $: 'symbol' } }),
    //             // parserFactory.create(UnquotedTokenParserImpl),
    //             parserBuilder.def(buildStringParserDef('"')),
    //             parserBuilder.def(buildStringParserDef(`'`)),
    //         ]
    //     })
    // )

    sp.add(
        new ContextSwitchingPStratumImpl({
            entry: 'command',
            contexts: {
                command: [
                    parserFactory.create(WhitespaceParserImpl),
                    parserBuilder.def(a => a.literal('|').assign({ $: 'op.pipe' })),
                    parserBuilder.def(a => a.literal('>').assign({ $: 'op.redirect', direction: 'out' })),
                    parserBuilder.def(a => a.literal('<').assign({ $: 'op.redirect', direction: 'in' })),
                    parserBuilder.def(a => a.literal(')').assign({ $: 'op.close' })),
                    {
                        parser: parserBuilder.def(a => a.literal('"').assign({ $: 'string.dquote' })),
                        transition: {
                            to: 'string.dquote',
                        }
                    },
                    {
                        parser: parserBuilder.def(a => a.literal(`'`).assign({ $: 'string.squote' })),
                        transition: {
                            to: 'string.squote',
                        }
                    },
                    {
                        parser: parserBuilder.def(a => a.none()),
                        transition: {
                            to: 'symbol',
                        }
                    },
                ],
                'string.dquote': buildStringContext('"'),
                'string.squote': buildStringContext(`'`),
                symbol: [
                    parserFactory.create(StrUntilParserImpl, {
                        stopChars: list_stoptoken,
                    }, { assign: { $: 'symbol' } }),
                    {
                        parser: parserBuilder.def(a => a.choice(
                            ...list_stoptoken.map(chr => a.literal(chr))
                        )),
                        transition: { pop: true }
                    }
                ],
            },
            wrappers: {
                'string.dquote': {
                    $: 'string',
                    quote: '"',
                },
                'string.squote': {
                    $: 'string',
                    quote: `'`,
                },
            },
        })
    )

    sp.add(
        new MergeWhitespacePStratumImpl()
    )
};