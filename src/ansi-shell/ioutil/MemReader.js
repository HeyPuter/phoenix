export class MemReader {
    constructor (data) {
        this.data = data;
        this.pos = 0;
    }
    async read (opt_buffer) {
        if ( this.pos >= this.data.length ) {
            return { done: true };
        }

        if ( ! opt_buffer ) {
            this.pos = this.data.length;
            return { value: this.data, done: false };
        }

        const toReturn = this.data.slice(
            this.pos,
            Math.min(this.pos + opt_buffer.length, this.data.length),
        );

        return {
            value: opt_buffer,
            size: toReturn.length
        };
    }
}
