import { XDocumentPTT } from "../XDocumentPTT";
import { XDocumentPuterShell } from "./XDocumentPuterShell";
import ReadlineLib from "./readline";

import command_registry from '../puter-shell/coreutils/__exports__';

// TODO: auto-gen argument parser registry from files
import SimpleArgParser from "./arg-parsers/simple-parser";
import { PuterANSIShell } from "../puter-shell/PuterANSIShell";
import { HiTIDE } from "hitide";
import { Context } from "contextlink";
import { SHELL_VERSIONS } from "../meta/versions";

const argparser_registry = {
    [SimpleArgParser.name]: SimpleArgParser
};

export const main_shell = async () => {
    const hitide = new HiTIDE();

    const ptt = new XDocumentPTT();
    const config = {};

    const puterShell = new XDocumentPuterShell({
        source: __CONFIG__['shell.href']
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
        if ( evt.data.$ !== 'config' ) return;

        console.log('received configuration at ANSI shell');
        const configValues = { ...evt.data };
        delete configValues.$;
        for ( const k in configValues ) {
            config[k] = configValues[k];
        }
        puterShell.configure(config);
        resolveConfigured();
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
    window.parent.postMessage({ $: 'ready' }, '*');
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

    // TODO: move ioctl to PTY
    window.addEventListener('message', evt => {
        if ( evt.source !== window.parent ) return;
        if ( evt.data instanceof Uint8Array ) {
            return;
        }
        if ( ! evt.data.hasOwnProperty('$') ) {
            console.error(`unrecognized window message`, evt);
            return;
        }
        if ( evt.data.$ !== 'ioctl.set' ) return;
        
        
        ansiShell.dispatchEvent(new CustomEvent('signal.window-resize', {
            detail: {
                ...evt.data.windowSize
            }
        }))
    });

    ctx.externs.out.write(
        `\x1B[35;1mPuter Shell\x1B[0m [v${SHELL_VERSIONS[0].v}]\n` +
        `⛷  try typing \x1B[34;1mhelp\x1B[0m or ` +
        `\x1B[34;1mchangelog\x1B[0m to get started.\n`
    );

    if ( ! config.hasOwnProperty('puter.auth.token') ) {
        ctx.externs.out.write('\n');
        ctx.externs.out.write(
            `\x1B[33;1m⚠\x1B[0m` +
            `\x1B[31;1m` +
            ' You are not running this terminal or shell within puter.com\n' +
            `\x1B[0m` +
            'Use of the shell outside of puter.com is still experimental. You \n' +
            'will experience incomplete features and bugs.\n' +
            ''
        );
    }

    ctx.externs.out.write('\n');

    for ( ;; ) {
        await ansiShell.doPromptIteration();
    }
};
