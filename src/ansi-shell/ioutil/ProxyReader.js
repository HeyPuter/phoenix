export class ProxyReader {
    constructor ({ delegate }) {
        this.delegate = delegate;
    }

    read (...a) { return this.delegate.read(...a); }
}
