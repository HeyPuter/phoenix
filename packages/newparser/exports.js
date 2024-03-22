class GrammarContext {
    constructor (parsers) {
        this.parsers = parsers;
    }

    sub (more_parsers) {
        return new GrammarContext([...this.parsers, ...more_parsers]);
    }

    define_parser (grammar) {
        const symbol_registry = {...grammar};

        // TODO: next
        // - turn every symbol (key in object `grammar`)
        //   into the same interface as other parsers so that
        //   symbol() can call it and pass it a stream
        // - make the other parser be functions too

        return entry_symbol => {
            //
        };
    }
}
