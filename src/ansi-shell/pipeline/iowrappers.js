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
            console.log('collect iter');
            const { value, done } = await this.rs.read();
            console.log('is done??', value, done)
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