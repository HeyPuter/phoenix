export class Coupler {
    static description = `
        Connects a read stream to a write stream.
        Does not close the write stream when the read stream is closed.
    `

    constructor (source, target) {
        this.source = source;
        this.target = target;
        this.on_ = true;
        this.isDone = new Promise(rslv => {
            this.resolveIsDone = rslv;
        })
        this.listenLoop_();
    }

    off () { this.on_ = false; }
    on () { this.on_ = true; }

    async listenLoop_ () {
        this.active = true;
        for (;;) {
            const { value, done } = await this.source.read();
            if ( done ) {
                this.source = null;
                this.target = null;
                this.active = false;
                this.resolveIsDone();
                break;
            }
            if ( this.on_ ) {
                await this.target.write(value);
            }
        }
    }
}
