export class MultiWriter {
    constructor ({ delegates }) {
        this.delegates = delegates;
    }

    async write (item) {
        for ( const delegate of this.delegates ) {
            await delegate.write(item);
        }
    }

    async close () {
        for ( const delegate of this.delegates ) {
            await delegate.close();
        }
    }
}
