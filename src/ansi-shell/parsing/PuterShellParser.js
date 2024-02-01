import { StrataParser, StringPStratumImpl } from "strataparse";
import { buildParserFirstHalf } from "./buildParserFirstHalf";
import { buildParserSecondHalf } from "./buildParserSecondHalf";

export class PuterShellParser {
    constructor () {
        {
        }
    }
    parseLineForSyntax () {}
    parseLineForProcessing (input) {
        const sp = new StrataParser();
        sp.add(new StringPStratumImpl(input));
        // TODO: optimize by re-using this parser
        buildParserFirstHalf(sp, "interpreting");
        buildParserSecondHalf(sp);
        const result = sp.parse();
        if ( sp.error ) {
            throw new Error(sp.error);
        }
        console.log('PARSER RESULT', result);
        return result;
    }
}
