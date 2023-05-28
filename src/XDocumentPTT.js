import { BetterReader } from "dev-pty";

const encoder = new TextEncoder();

export class XDocumentPTT {
    constructor() {
        this.readableStream = new ReadableStream({
            start: controller => {
                this.readController = controller;
            }
        });
        this.writableStream = new WritableStream({
            start: controller => {
                this.writeController = controller;
            },
            write: chunk => {
                if (typeof chunk === 'string') {
                    chunk = encoder.encode(chunk);
                }
                window.parent.postMessage(chunk, '*');
            }
        });
        this.out = this.writableStream.getWriter();
        this.in = this.readableStream.getReader();
        this.in = new BetterReader({ delegate: this.in });

        window.addEventListener('message', evt => {
            if ( ! evt.source === window.parent ) return;
            if ( ! (evt?.data instanceof Uint8Array) ) return;
            this.readController.enqueue(evt.data);
        });
    }
}
