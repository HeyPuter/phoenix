import { ANSIContext } from "../ANSIContext";
import { signals } from "../signals";
import { ProxyReader } from "./ProxyReader";

const encoder = new TextEncoder();

export class SignalReader extends ProxyReader {
    constructor ({ sig, ...kv }, ...a) {
        super({ ...kv }, ...a);
        this.sig = sig;
    }

    async read (opt_buffer) {
        const mapping = [
            [ANSIContext.constants.CHAR_ETX, signals.SIGINT],
            [ANSIContext.constants.CHAR_EOT, signals.SIGQUIT],
        ];

        let { value, done } = await this.delegate.read(opt_buffer);

        if ( value === undefined ) {
            return { value, done };
        }

        const tmp_value = value;

        if ( ! tmp_value instanceof Uint8Array ) {
            tmp_value = encoder.encode(value);
        }

        // show hex for debugging
        // console.log(value.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));
        console.log('value??', value)

        for ( const [key, signal] of mapping ) {
            if ( tmp_value.includes(key) ) {
                console.log('GOPT IT!', key)
                this.sig.emit(signal);
                if ( signal === signals.SIGQUIT ) {
                    return { done: true };
                }
            }
        }

        return { value, done };
    }
}
