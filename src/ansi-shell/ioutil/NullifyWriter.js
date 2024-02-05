import { ProxyWriter } from "./ProxyWriter.js";

export class NullifyWriter extends ProxyWriter {
    async write (item) {
        // NOOP
    }

    async close () {
        await this.delegate.close();
    }
}
