import { ProxyWriter } from "./ProxyWriter.js";

const encoder = new TextEncoder();

export class ByteWriter extends ProxyWriter {
    async write (item) {
        if ( typeof item === 'string' ) {
            item = encoder.encode(item);
        }
        if ( item instanceof Blob ) {
            item = new Uint8Array(await item.arrayBuffer());
        }
        await this.delegate.write(item);
    }
}
