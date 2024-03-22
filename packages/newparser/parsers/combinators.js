import { INVALID, UNRECOGNIZED, VALUE, adapt_parser } from "../lib";

export class Sequence extends Parser {
    _create (...parsers) {
        this.parsers = parsers.map(adapt_parser);
    }

    _parse (stream) {
        const results = [];
        for ( const parser of this.parsers ) {
            const subStream = stream.fork();
            const result = parser.parse(subStream);
            if ( result.status === UNRECOGNIZED ) {
                return UNRECOGNIZED;
            }
            if ( result.status === INVALID ) {
                return { status: INVALID, value: result };
            }
            stream.join(subStream);
            results.push(result.value);
        }

        return { status: VALUE, value: results };
    }
}
