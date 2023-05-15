export class ProxyWriter {
    constructor ({ delegate }) {
        this.delegate = delegate;
    }

    write (...a) { return this.delegate.write(...a); }
    close (...a) { return this.delegate.close(...a); }
}
