const list_ws = [' ', '\n', '\t'];
const list_quot = [`"`, `'`];
const list_stoptoken = [
    '|','>','<','&','\\','#',';','(',')',
    ...list_ws,
    ...list_quot
];

export class UnquotedTokenParserImpl {
    static meta = {
        inputs: 'bytes',
        outputs: 'node'
    }
    static data = {
        excludes: list_stoptoken
    }
    parse (lexer) {
        const { excludes } = this.constructor.data;
        let text = '';

        for ( ;; ) {
            const { done, value } = lexer.look();
            if ( done ) break;
            const str = String.fromCharCode(value);
            if ( excludes.includes(str) ) break;
            text += str;
            lexer.next();
        }

        if ( text.length === 0 ) return;
        
        return { $: 'symbol', text };
    }
}
