import { XDocumentPTT } from "../XDocumentPTT";
import { XDocumentPuterShell } from "./XDocumentPuterShell";
import ReadlineLib from "./readline";

// TODO: auto-gen command registry from files
import CommandLS from '../puter-shell/coreutils/ls'
import CommandTail from '../puter-shell/coreutils/tail'
const command_registry = {
    ls: CommandLS,
    tail: CommandTail,
};

// TODO: auto-gen argument parser registry from files
import SimpleArgParser from "./arg-parsers/simple-parser";
import { PuterANSIShell } from "../puter-shell/PuterANSIShell";
import { HiTIDE } from "hitide";
import { Context } from "contextlink";

const argparser_registry = {
    [SimpleArgParser.name]: SimpleArgParser
};

export const main_shell = async () => {
    const hitide = new HiTIDE();

    const ptt = new XDocumentPTT();
    const config = {};

    const puterShell = new XDocumentPuterShell({
        source: 'https://puter.local:8081'
    });

    let resolveConfigured = null;
    const configured_ = new Promise(rslv => {
        resolveConfigured = rslv;
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
            resolveConfigured();
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

    await configured_;

    const ctx = new Context({
        externs: new Context({
            config, readline, puterShell,
            in: ptt.in,
            out: ptt.out,
        }),
        registries: new Context({
            commands: command_registry,
            argparsers: argparser_registry,
        }),
        locals: new Context(),
    });
    const ansiShell = new PuterANSIShell(ctx);

    for ( ;; ) {
        await ansiShell.doPromptIteration();
    }
};
