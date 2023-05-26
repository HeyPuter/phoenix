export class SymbolParserImpl {
    static meta = {
        inputs: 'bytes',
        outputs: 'node'
    }
    static data = {
        rexp0: /[A-Za-z_]/,
        rexpN: /[A-Za-z0-9_]/,
    }
    parse (lexer) {
        let { done, value } = lexer.look();
        if ( done ) return;

        const { rexp0, rexpN } = this.constructor.data;

        value = String.fromCharCode(value);
        if ( ! rexp0.test(value) ) return;

        let text = '' + value;
        lexer.next();

        for ( ;; ) {
            ({ done, value } = lexer.look());
            if ( done ) break;
            value = String.fromCharCode(value);
            if ( ! rexpN.test(value) ) break;
            text += value;
            lexer.next();
        }
        
        return { $: 'symbol', text };
    }
}
