import { XDocumentPTT } from "../XDocumentPTT";
import { Context } from "../context/context";
import { XDocumentPuterShell } from "./XDocumentPuterShell";
import ReadlineLib from "./readline";

// TODO: auto-gen command registry from files
import CommandLS from '../puter-shell/coreutils/ls'
const command_registry = {
    ls: CommandLS
};

// TODO: auto-gen argument parser registry from files
import SimpleArgParser from "./arg-parsers/simple-parser";
const argparser_registry = {
    [SimpleArgParser.name]: SimpleArgParser
};

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
        // TODO: add proper tokenizer
        const tokens = input.split(' ');
        const cmd = tokens.shift();
        if ( ! command_registry.hasOwnProperty(cmd) ) {
            ptt.out.write(`no command: ${JSON.stringify(cmd)}\n`);
            continue;
        }

        const command = command_registry[cmd];
        const ctx = {
            externs: {
                out: ptt.out
            },
            locals: {
                command,
                args: tokens,
                valid: true,
            }
        };
        if ( command.args ) {
            const argProcessorId = command.args.$;
            const argProcessor = argparser_registry[argProcessorId];
            const spec = { ...command.args };
            delete spec.$;
            argProcessor.process(ctx, spec);
        }
        if ( ! ctx.locals.valid ) continue;
        command.invoke(ctx);
    }
};
