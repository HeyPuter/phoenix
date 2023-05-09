import { XDocumentPTT } from "../XDocumentPTT";
import { Context } from "../context/context";
import { XDocumentPuterShell } from "./XDocumentPuterShell";
import ReadlineLib from "./readline";

export const main_shell = async () => {
    const ptt = new XDocumentPTT();
    const config = {};

    const puterShell = new XDocumentPuterShell({
        source: 'https://puter.local:8081'
    });

    window.addEventListener('message', evt => {
        if ( evt.source !== window.parent ) return;
        if ( evt.data instanceof Uint8Array ) {
            return;
        }
        if ( ! evt.data.hasOwnProperty('$') ) {
            console.error(`unrecognized window message`, evt);
            return;
        }
        // ???: This is the only valid type right now;
        //      in the future there may be more valid messages(?)
        if ( evt.data.$ === 'config' ) {
            console.log('received configuration at ANSI shell');
            const configValues = { ...evt.data };
            delete configValues.$;
            for ( const k in configValues ) {
                config[k] = configValues[k];
            }
            puterShell.configure(config);
            return;
        }
        console.error(`unrecognized window message`, evt);
    });

    // let readyQueue = Promise.resolve();
    let readyQueue = Promise.resolve();

    // === Setup Puter Shell Iframe ===
    {
        const iframe = document.createElement('iframe');
        const xdEl = document.getElementById('cross-document-container');

        readyQueue = readyQueue.then(() => new Promise(rslv => {
            puterShell.addEventListener('ready', rslv)
        }));

        xdEl.appendChild(iframe);
        puterShell.attachToIframe(iframe);
    }

    const readline = ReadlineLib.create({
        in: ptt.in,
        out: ptt.out
    });

    await readyQueue;

    console.log('the adapter is saying ready');
    window.parent.postMessage({ $: 'ready' });
    console.log('the adapter said ready');

    for ( ;; ) {
        const input = await readline('> ');
        ptt.out.write('got input: ' + input + '\n');
    }
};
