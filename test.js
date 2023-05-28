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

const result = sp.parse();
console.log(result && JSON.stringify(result, undefined, '  '));
if ( sp.error ) {
    console.log('has error:', sp.error);
}
