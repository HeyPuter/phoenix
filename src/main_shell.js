import { XDocumentPTT } from "./XDocumentPTT";
import { Context } from "./context/context";
import ReadlineLib from "./shell/readline";

export const main_shell = async () => {
    const ptt = new XDocumentPTT();
    const config = {};

    window.addEventListener('message', evt => {
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
            const configValues = { ...evt.data };
            delete configValues.$;
            for ( const k in configValues ) {
                config[k] = configValues[k];
            }
            return;
        }
        console.error(`unrecognized window message`, evt);
    });

    // (async () => {
    //     for ( ;; ) {
    //         const chunk = (await ptt.in.read()).value;
    //         console.log('gott it', chunk);
    //         ptt.out.write(chunk);
    //     }
    // })();

    const readline = ReadlineLib.create({
        in: ptt.in,
        out: ptt.out
    });

    window.parent.postMessage({ $: 'ready' });

    for ( ;; ) {
        const input = await readline('> ');
        ptt.out.write('got input: ' + input + '\n');
    }
};
