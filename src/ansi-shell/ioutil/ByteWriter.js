import { ProxyWriter } from "./ProxyWriter";

const encoder = new TextEncoder();

export class ByteWriter extends ProxyWriter {
    async write (item) {
        if ( typeof item === 'string' ) {
            item = encoder.encode(item);
        }
        await this.delegate.write(item);
    }
}
