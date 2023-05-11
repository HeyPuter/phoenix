export class Coupler {
    static description = `
        Connects a read stream to a write stream.
        Does not close the write stream when the read stream is closed.
    `

    constructor (source, target) {
        this.source = source;
        this.target = target;
        this.listenLoop_();
    }

    async listenLoop_ () {
        this.active = true;
        for (;;) {
            const { value, done } = await this.source.read();
            if ( done ) {
                this.source = null;
                this.target = null;
                this.active = false;
                break;
            }
            await this.target.write(value);
        }
    }
}
