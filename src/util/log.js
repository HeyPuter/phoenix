export class Log {
    static log (...items) {
        items = items.map(this.toString);
        console.log(...items);
    }

    static toString (item) {
        if ( item instanceof Uint8Array ) {
            return [...item]
                .map(x => x.toString(16).padStart(2, '0'))
                .join('');
        }

        return item;
    }
}
