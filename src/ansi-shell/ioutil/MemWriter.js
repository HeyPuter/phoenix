export class MemWriter {
    constructor () {
        this.items = [];
    }
    async write (item) {
        this.items.push(item);
    }
    async close () {}
}