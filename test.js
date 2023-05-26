import {
    Parser,
    ParseResult,
    WhitespaceParserImpl,
    LiteralParserImpl,
    PStratum,
    FirstRecognizedPStratumImpl,
    StringPStratumImpl,
    StrataParser,
    ParserFactory,
} from 'strataparse';
import { SymbolParserImpl } from './src/ansi-shell/parsing/shell_parser.js';
import { MergeWhitespacePStratumImpl } from 'strataparse/strata_impls/MergeWhitespacePStratumImpl.js';


const sp = new StrataParser();

const cstParserFac = new ParserFactory()
cstParserFac.concrete = true;

sp.add(
    new StringPStratumImpl(`
        ls | tail -n 2 > "test \\"file\\".txt"
    `)
);
sp.add(
    new FirstRecognizedPStratumImpl({
        parsers: [
            cstParserFac.create(WhitespaceParserImpl),
            cstParserFac.create(LiteralParserImpl, { value: '|' }, {
                assign: { $: 'pipe' }
            }),
            cstParserFac.create(SymbolParserImpl),
        ]
    })
);

sp.add(
    new MergeWhitespacePStratumImpl()
)

// let wsp = new WhitespaceParserImpl();
// let lex = new StringPStratumImpl('   test');
// lex = new PStratum(lex);

// let tdp = new FirstRecognizedPStratumImpl({
//     parsers: [wsp]
// });
// tdp = new PStratum(tdp);
// tdp.setDelegate(lex);

// const result = tdp.next();
const result = sp.parse();
console.log(result);
if ( sp.error ) {
    console.log('has error:', sp.error);
}
// {
//     const result = sp.next();
//     console.log('result 1', result);
// }
// {
//     const result = sp.next();
//     console.log('result 2', result);
// }
// {
//     const result = sp.next();
//     console.log('result 2', result);
// }

// const l2 = lex.fork();
// const result = wsp.parse(lex);
// console.log('result?', result);
// console.log('lex next', lex.next());
// console.log('l2 next', l2.next());