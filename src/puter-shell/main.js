import builtins from './coreutils/__exports__.js';
import { XDocumentPTT } from "../XDocumentPTT.js";
import ReadlineLib from "../ansi-shell/readline/readline.js";

// TODO: auto-gen argument parser registry from files
import SimpleArgParser from "../ansi-shell/arg-parsers/simple-parser.js";
import ErrorsDecorator from "../ansi-shell/decorators/errors.js";
import { ANSIShell } from "../ansi-shell/ANSIShell.js";
import { Context } from "contextlink";
import { SHELL_VERSIONS } from "../meta/versions.js";
import { PuterShellParser } from "../ansi-shell/parsing/PuterShellParser.js";
import { BuiltinCommandProvider } from "./providers/BuiltinCommandProvider.js";
import { CreateChatHistoryPlugin } from './plugins/ChatHistoryPlugin.js';
import { Pipe } from '../ansi-shell/pipeline/Pipe.js';
import { Coupler } from '../ansi-shell/pipeline/Coupler.js';
import { BetterReader } from 'dev-pty';
import { MultiWriter } from '../ansi-shell/ioutil/MultiWriter.js';
import { CompositeCommandProvider } from './providers/CompositeCommandProvider.js';
import { ScriptCommandProvider } from './providers/ScriptCommandProvider.js';

const argparser_registry = {
    [SimpleArgParser.name]: SimpleArgParser
};

const decorator_registry = {
    [ErrorsDecorator.name]: ErrorsDecorator
};

export const launchPuterShell = async (ctx) => {
    const ptt = new XDocumentPTT();
    const config = ctx.config;
    const puterShell = ctx.puterShell;

    // Need to replace `in` with something we can write to
    const real_pipe = new Pipe();
    const echo_pipe = new Pipe();
    const out_writer = new MultiWriter({
        delegates: [
            echo_pipe.in,
            real_pipe.in,
        ]
    })
    new Coupler(ptt.in, out_writer);
    const echo = new Coupler(echo_pipe.out, ptt.out);
    const stdin = new BetterReader({ delegate: real_pipe.out });
    echo.off();

    const readline = ReadlineLib.create({
        in: stdin,
        out: ptt.out
    });

    const sdkv2 = globalThis.puter;
    await sdkv2.setAuthToken(config['puter.auth.token']);
    const source_without_trailing_slash =
        (config.source && config.source.replace(/\/$/, ''))
        || 'https://api.puter.com';
    await sdkv2.setAPIOrigin(source_without_trailing_slash);

    // const commandProvider = new BuiltinCommandProvider();
    const commandProvider = new CompositeCommandProvider([
        new BuiltinCommandProvider(),
        new ScriptCommandProvider(),
    ]);

    ctx = ctx.sub({
        externs: new Context({
            config, puterShell,
            readline: readline.readline.bind(readline),
            in: stdin,
            out: ptt.out,
            echo,
            parser: new PuterShellParser(),
            commandProvider,
            sdkv2,
            historyManager: readline.history,
        }),
        registries: new Context({
            argparsers: argparser_registry,
            decorators: decorator_registry,
            // While we use the BuiltinCommandProvider to provide the
            // functionality of command lookup, we still need a registry
            // of builtins to support the `help` command.
            builtins,
        }),
        plugins: new Context(),
        locals: new Context(),
    });

    {
        const name = "chatHistory";
        const p = CreateChatHistoryPlugin(ctx);
        ctx.plugins[name] = new Context(p.expose);
        p.init();
    }

    const ansiShell = new ANSIShell(ctx);

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
