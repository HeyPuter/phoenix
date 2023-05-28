import { FirstRecognizedPStratumImpl, ParserBuilder, ParserFactory, StrUntilParserImpl, StrataParseFacade, WhitespaceParserImpl } from "strataparse";
import { UnquotedTokenParserImpl } from "./UnquotedTokenParserImpl.js";
import { PARSE_CONSTANTS } from "./PARSE_CONSTANTS.js";

const parserConfigProfiles = {
    syntaxHighlighting: { cst: true },
    interpreting: { cst: false }
};

// NEXT: ALT: 1. until(delegate, list)
//            2. think of something else
// NEXT: buildParserSecondHalf

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

    const buildStringParserDef = quote => {
        return a => a.sequence(
            a.literal(quote),
            a.repeat(a.choice(
                // TODO: replace this with proper parser
                parserFactory.create(StrUntilParserImpl, {
                    stopChars: ['\\', quote],
                }),
                a.sequence(
                    a.literal('\\'),
                    a.choice(
                        a.literal(quote),
                        a.literal('n'),
                        a.literal('r'),
                        a.literal('t'),
                    )
                ).assign({ $: 'string.escape' })
            )),
            a.literal(quote),
        ).assign({ $: 'string' })
    };

    sp.add(
        new FirstRecognizedPStratumImpl({
            parsers: [
                parserFactory.create(WhitespaceParserImpl),
                parserBuilder.def(a => a.literal('|').assign({ $: 'op.pipe' })),
                parserBuilder.def(a => a.literal('>').assign({ $: 'op.redirect', direction: 'out' })),
                parserBuilder.def(a => a.literal('<').assign({ $: 'op.redirect', direction: 'in' })),
                parserFactory.create(UnquotedTokenParserImpl),
                parserBuilder.def(buildStringParserDef('"')),
                parserBuilder.def(buildStringParserDef(`'`)),
            ]
        })
    )
};