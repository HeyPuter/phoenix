export default class StrUntilParserImpl {
    constructor ({ stopChars }) {
        this.stopChars = stopChars;
    }
    parse (lexer) {
        let text = '';
        for ( ;; ) {
            console.log('B')
            let { done, value } = lexer.look();

            if ( done ) break;

            // TODO: doing this strictly one byte at a time
            //       doesn't allow multi-byte stop characters
            if ( typeof value === 'number' ) value =
                String.fromCharCode(value);

            if ( this.stopChars.includes(value) ) break;

            text += value;
            lexer.next();
        }

        if ( text.length === 0 ) return;

        console.log('test?', text)

        return { $: 'until', text };
    }
}
