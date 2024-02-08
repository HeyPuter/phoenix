export class Exit extends Error {
    constructor (code) {
        super(`exit ${code}`);
        this.code = code;
    }
}
