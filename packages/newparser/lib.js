export const adapt_parser = v => v;

export const UNRECOGNIZED = Symbol('unrecognized');
export const INVALID = Symbol('invalid');
export const VALUE = Symbol('value');

export class Parser {
    result (o) {
        return o;
    }

    parse (stream) {
        let result = this._parse(stream);
        if ( typeof result !== 'object' ) {
            result = { status: result };
        }
        return this.result(result);
    }

    set_symbol_registry (symbol_registry) {
        this.symbol_registry = symbol_registry;
    }

    _create () { throw new Error(`${this.constructor.name}._create() not implemented`); }
    _parse (stream) { throw new Error(`${this.constructor.name}._parse() not implemented`); }
}
