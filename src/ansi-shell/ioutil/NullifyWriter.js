import { ProxyWriter } from "./ProxyWriter";

export class NullifyWriter extends ProxyWriter {
    async write (item) {
        // NOOP
    }

    async close () {
        await this.delegate.close();
    }
}
