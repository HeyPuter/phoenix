export class Uint8List {
    constructor (initialSize) {
        initialSize = initialSize || 2;

        this.array = new Uint8Array(initialSize);
        this.size = 0;
    }

    get capacity () {
        return this.array.length;
    }

    append (chunk) {
        if ( typeof chunk === 'number' ) {
            chunk = new Uint8Array([chunk]);
        }

        const sizeNeeded = this.size + chunk.length;
        let newCapacity = this.capacity;
        while ( sizeNeeded > newCapacity ) {
            newCapacity *= 2;
        }

        if ( newCapacity !== this.capacity ) {
            const newArray = new Uint8Array(newCapacity);
            newArray.set(this.array, 0);
            this.array = newArray;
        }

        this.array.set(chunk, this.size);
        this.size += chunk.length;
    }

    toArray () {
        return this.array.subarray(0, this.size);
    }
}