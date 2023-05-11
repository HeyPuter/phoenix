export class CommandStdinDecorator {
    constructor (rs) {
        this.rs = rs;
    }
    async read (...a) {
        return await this.rs.read(...a);
    }

    // utility methods
    async collect () {
        const items = [];
        for (;;) {
            const { value, done } = await this.rs.read();
            if ( done ) return items;
            items.push(value);
        }
    }
}

export class CommandStdoutDecorator {
    constructor (delegate) {
        this.delegate = delegate;
    }
    async write (...a) {
        return await this.delegate.write(...a);
    }
}