const CHAR_LF = '\n'.charCodeAt(0);
const CHAR_CR = '\r'.charCodeAt(0);

class Readline {
    constructor (params) {
        this.internal_ = {};
        for ( const k in params ) this.internal_[k] = params[k];
    }

    async readline (prompt) {
        const out = this.internal_.out;
        const in_ = this.internal_.in;

        out.write(prompt);

        let text = '';

        const decoder = new TextDecoder();

        while ( true ) {
            const byteBuffer = new Uint8Array(1);
            await in_.read(byteBuffer);

            const byte = byteBuffer[0];
            if ( byte === CHAR_LF ) {
                out.write('\n');
                break;
            }

            out.write(byteBuffer);
            const part = decoder.decode(byteBuffer);
            text += part;
        }

        // const text = await in_.readLine({ stream: out });
        return text;
    }
}

export default class ReadlineLib {
    static create(params) {
        const rl = new Readline(params);
        return rl.readline.bind(rl);
    }
}
