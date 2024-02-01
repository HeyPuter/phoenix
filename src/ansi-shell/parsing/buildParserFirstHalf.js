import { FirstRecognizedPStratumImpl, ParserBuilder, ParserFactory, StrUntilParserImpl, StrataParseFacade, WhitespaceParserImpl } from "strataparse";
import { UnquotedTokenParserImpl } from "./UnquotedTokenParserImpl.js";
import { PARSE_CONSTANTS } from "./PARSE_CONSTANTS.js";
import { MergeWhitespacePStratumImpl } from "strataparse/strata_impls/MergeWhitespacePStratumImpl.js";

const parserConfigProfiles = {
    syntaxHighlighting: { cst: true },
    interpreting: { cst: false }
};

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

    sp.add(
        new FirstRecognizedPStratumImpl({
            parsers: [
                parserFactory.create(WhitespaceParserImpl),
                parserBuilder.def(a => a.literal('|').assign({ $: 'op.pipe' })),
                parserBuilder.def(a => a.literal('>').assign({ $: 'op.redirect', direction: 'out' })),
                parserBuilder.def(a => a.literal('<').assign({ $: 'op.redirect', direction: 'in' })),
                parserBuilder.def(a => a.literal('$((').assign({ $: 'op.arithmetic' })),
                parserBuilder.def(a => a.literal('$(').assign({ $: 'op.cmd-subst' })),
                parserBuilder.def(a => a.literal(')').assign({ $: 'op.close' })),
                parserFactory.create(UnquotedTokenParserImpl),
                parserBuilder.def(buildStringParserDef('"')),
                parserBuilder.def(buildStringParserDef(`'`)),
            ]
        })
    )

    sp.add(
        new MergeWhitespacePStratumImpl()
    )
};