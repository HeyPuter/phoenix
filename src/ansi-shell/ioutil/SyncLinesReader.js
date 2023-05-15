import { ProxyReader } from "./ProxyReader";

const decoder = new TextDecoder();

export class SyncLinesReader extends ProxyReader {
    constructor (...a) {
        super(...a);
        this.lines = [];
        this.fragment = '';
    }
    async read (opt_buffer) {
        if ( opt_buffer ) {
            // Line sync contradicts buffered reads
            return await this.delegate.read(opt_buffer);
        }

        return await this.readNextLine_();
    }
    async readNextLine_ () {
        if ( this.lines.length > 0 ) {
            return { value: this.lines.shift() };
        }

        for ( ;; ) {
            // CHECK: this might read once more after done; is that ok?
            let { value, done } = await this.delegate.read();

            if ( value instanceof Uint8Array ) {
                value = decoder.decode(value);
            }

            if ( done ) {
                if ( this.fragment.length === 0 ) {
                    return { value, done };
                }

                value = this.fragment;
                this.fragment = '';
                return { value };
            }

            if ( ! value.includes('\n') ) {
                this.fragment += value;
                continue;
            }

            // guarenteed to be 2 items, because value includes '\n'
            const lines = value.split('\n');

            // The first line continues from the existing fragment
            const firstLine = this.fragment + lines.shift();
            // The last line is incomplete, and goes on the fragment
            this.fragment = lines.pop();

            // Any lines between are enqueued for subsequent reads,
            // and they include a line-feed character.
            this.lines.push(...lines.map(txt => txt + '\n'));

            return { value: firstLine + '\n' };
        }
    }
}
