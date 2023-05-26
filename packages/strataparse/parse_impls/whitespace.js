export default class WhitespaceParserImpl {
    static meta = {
        inputs: 'bytes',
        outputs: 'node'
    }
    static data = {
        whitespaceCharCodes: ' \r\n\t'.split('')
            .map(chr => chr.charCodeAt(0))
    }
    parse (lexer) {
        const { whitespaceCharCodes } = this.constructor.data;

        let text = '';

        for ( ;; ) {
            const { done, value } = lexer.look();
            if ( done ) break;
            if ( ! whitespaceCharCodes.includes(value) ) break;
            text += String.fromCharCode(value);
            lexer.next();
        }

        if ( text.length === 0 ) return;

        return { $: 'whitespace', text };
    }
}
