export class Pipe {
    constructor () {
        this.readableStream = new ReadableStream({
            start: controller => {
                this.readController = controller;
            }
        });
        this.writableStream = new WritableStream({
            start: controller => {
                this.writableController = controller;
            },
            write: item => {
                this.readController.enqueue(item);
            }
        });
    }
}
