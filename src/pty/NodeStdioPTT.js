import { ReadableStream, WritableStream } from 'stream/web';

const writestream_node_to_web = node_stream => {
    return node_stream;
    // return new WritableStream({
    //     write: chunk => {
    //         node_stream.write(chunk);
    //     }
    // });
};

export class NodeStdioPTT {
    constructor() {
        // this.in = process.stdin;
        // this.out = process.stdout;
        // this.err = process.stderr;

        // this.in = ReadableStream.from(process.stdin).getReader();

        let readController;
        const readableStream = new ReadableStream({
            start: controller => {
                readController = controller;
            }
        });
        this.in = readableStream.getReader();
        process.stdin.on('data', chunk => {
            readController.enqueue(chunk);
        });

        this.out = writestream_node_to_web(process.stdout);
        this.err = writestream_node_to_web(process.stderr);

        this.ioctl_listeners = {};

        process.stdout.on('resize', () => {
            this.emit('ioctl.set', {
                data: {
                    windowSize: {
                        rows: process.stdout.rows,
                        cols: process.stdout.columns,
                    }
                }
            });
        });

        // Trap SIGINT and SIGQUIT
        process.on('SIGINT', () => {
            readController.enqueue(new Uint8Array([3]));
            process.exit(1);
        });
        process.stdin.on('end', () => {
            globalThis.force_eot = true;
            readController.enqueue(new Uint8Array([4]));
        });
    }

    on (name, listener) {
        if ( ! this.ioctl_listeners.hasOwnProperty(name) ) {
            this.ioctl_listeners[name] = [];
        }
        this.ioctl_listeners[name].push(listener);
    }

    emit (name, evt) {
        if ( ! this.ioctl_listeners.hasOwnProperty(name) ) return;
        for ( const listener of this.ioctl_listeners[name] ) {
            listener(evt);
        }
    }
}
