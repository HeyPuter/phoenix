export class Pipe {
    constructor () {
        this.readableStream = new ReadableStream({
            start: controller => {
                this.readController = controller;
            },
            close: () => {
                this.writableController.close();
            }
        });
        this.writableStream = new WritableStream({
            start: controller => {
                this.writableController = controller;
            },
            write: item => {
                this.readController.enqueue(item);
            },
            close: () => {
                this.readController.close();
            }
        });
        this.in  = this.writableStream.getWriter();
        this.out = this.readableStream.getReader();
    }
}
