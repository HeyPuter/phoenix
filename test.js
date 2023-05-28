import {
    StringPStratumImpl,
    StrataParser,
    ParserFactory,
} from 'strataparse';
import { buildParserFirstHalf } from './src/ansi-shell/parsing/buildParserFirstHalf.js';
import { buildParserSecondHalf } from './src/ansi-shell/parsing/buildParserSecondHalf.js';


const sp = new StrataParser();

const cstParserFac = new ParserFactory()
cstParserFac.concrete = true;
cstParserFac.rememberSource = true;

sp.add(
    new StringPStratumImpl(`
        ls | tail -n 2 "ab" > "te\\"st"
    `)
);

// buildParserFirstHalf(sp, 'syntaxHighlighting');
buildParserFirstHalf(sp, 'interpreting');
buildParserSecondHalf(sp);

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
// console.log(result);
console.log(result && JSON.stringify(result, undefined, '  '));
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