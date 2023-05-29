import path_ from "path-browserify";

// DRY: used by commands as well
const resolve = (ctx, relPath) => {
    if ( relPath.startsWith('/') ) {
        return relPath;
    }
    return path_.resolve(ctx.vars.pwd, relPath);
};

import { SyncLinesReader } from "../ioutil/SyncLinesReader";
import { TOKENS } from "../readline/readtoken";
import { ByteWriter } from "../ioutil/ByteWriter";
import { Coupler } from "./Coupler";
import { CommandStdinDecorator } from "./iowrappers";
import { Pipe } from "./Pipe";
import { MemReader } from "../ioutil/MemReader";
import { MemWriter } from "../ioutil/MemWriter";
import { MultiWriter } from "../ioutil/MultiWriter";

export class PreparedCommand {
    static createFromAST (ctx, ast) {
        if ( ast.$ !== 'command' ) {
            throw new Error('expected command node');
        }
        
        // TODO: check that node for command name is of a
        //       supported type - maybe use adapt pattern
        const cmd = ast.command.text;

        const { commands } = ctx.registries;

        if ( ! commands.hasOwnProperty(cmd) ) {
            throw new Error('no command: ' + JSON.stringify(cmd));
        }

        const command = commands[cmd];

        // TODO: test this
        const inputRedirect = ast.inputRedirects.length > 0 ?
            { path: ast.inputRedirects[0].path.text } : null;
        // TODO: test this
        const outputRedirects = ast.outputRedirects.map(rdirNode => {
            return { path: rdirNode.path.text };
        });

        return new PreparedCommand({
            command,
            args: ast.args.map(node => node.text),
            inputRedirect,
            outputRedirects,
        });
    }

    constructor ({ command, args, inputRedirect, outputRedirects }) {
        this.command = command;
        this.args = args;
        this.inputRedirect = inputRedirect;
        this.outputRedirects = outputRedirects;
    }

    setContext (ctx) {
        this.ctx = ctx;
    }

    async execute () {
        const { command, args } = this;

        const { argparsers } = this.ctx.registries;

        let in_ = this.ctx.externs.in_;
        if ( this.inputRedirect ) {
            const { puterShell } = this.ctx.externs;
            const response = await puterShell.command(
                'call-puter-api', {
                    command: 'read',
                    params: {
                        path: resolve(this.ctx, this.inputRedirect.path),
                    },
                }
            );
            if ( response.$ !== 'message' ) {
                throw new Error(
                    // TODO: elaborate
                    `error: could not get input file`
                );
            }
            console.log('INPUTT CONTESNTSSS...', response.message);
            in_ = new MemReader(response.message);
        }
        if ( command.input?.syncLines ) {
            in_ = new SyncLinesReader({ delegate: in_ });
        }
        in_ = new CommandStdinDecorator(in_);

        let out = this.ctx.externs.out;
        const outputMemWriters = [];
        if ( this.outputRedirects.length > 0 ) {
            for ( let i=0 ; i < this.outputRedirects.length ; i++ ) {
                outputMemWriters.push(new MemWriter());
            }
            out = new MultiWriter({
                delegates: [...outputMemWriters, out],
            });
        }

        const ctx = this.ctx.sub({
            externs: {
                in_,
                out,
            },
            cmdExecState: {
                valid: true
            },
            locals: {
                command,
                args
            }
        });

        if ( command.args ) {
            const argProcessorId = command.args.$;
            const argProcessor = argparsers[argProcessorId];
            const spec = { ...command.args };
            delete spec.$;
            argProcessor.process(ctx, spec);
        }

        if ( ! ctx.cmdExecState.valid ) {
            ctx.locals.exit = -1;
            ctx.externs.out.close();
            return;
        }
        
        try {
            await command.execute(ctx);
        } catch (e) {
            await ctx.externs.err.write(
                '\x1B[31;1m' +
                command.name + ': ' +
                e.toString() + '\x1B[0m\n'
            );
            ctx.locals.exit = -1;
        }

        // ctx.externs.in?.close?.();
        // ctx.externs.out?.close?.();
        ctx.externs.out.close();

        // TODO: need write command from puter-shell before this can be done
        for ( let i=0 ; i < this.outputRedirects.length ; i++ ) {
            console.log('output redirect??', this.outputRedirects[i]);
            const { puterShell } = this.ctx.externs;
            const outputRedirect = this.outputRedirects[i];
            const path = resolve(ctx, outputRedirect.path);
            // TODO: error handling here
            await puterShell.command(
                'call-puter-api', {
                    command: 'write',
                    params: {
                        path: path,
                        file: outputMemWriters[i].getAsBlob(),
                    },
                }
            );
        }

        console.log('OUTPUT WRITERS', outputMemWriters);
    }
}

export class Pipeline {
    static createFromAST (ctx, ast) {
        if ( ast.$ !== 'pipeline' ) {
            throw new Error('expected pipeline node');
        }

        const preparedCommands = [];

        for ( const cmdNode of ast.components ) {
            const command = PreparedCommand.createFromAST(ctx, cmdNode);
            preparedCommands.push(command);
        }

        return new Pipeline({ preparedCommands });
    }
    constructor ({ preparedCommands }) {
        this.preparedCommands = preparedCommands;
    }
    async execute (ctx) {
        const preparedCommands = this.preparedCommands;

        let nextIn = ctx.externs.in;
        let lastPipe = null;

        // TOOD: this will eventually defer piping of certain
        //       sub-pipelines to the Puter Shell.

        for ( let i=0 ; i < preparedCommands.length ; i++ ) {
            const command = preparedCommands[i];

            // if ( command.command.input?.syncLines ) {
            //     nextIn = new SyncLinesReader({ delegate: nextIn });
            // }

            const cmdCtx = { externs: { in_: nextIn } };

            const pipe = new Pipe();
            lastPipe = pipe;
            let cmdOut = pipe.in;
            cmdOut = new ByteWriter({ delegate: cmdOut });
            cmdCtx.externs.out = cmdOut;
            nextIn = pipe.out;

            // TODO: need to consider redirect from out to err
            cmdCtx.externs.err = ctx.externs.out;
            command.setContext(ctx.sub(cmdCtx));
        }


        const coupler = new Coupler(lastPipe.out, ctx.externs.out);

        const commandPromises = [];
        for ( let i = preparedCommands.length - 1 ; i >= 0 ; i-- ) {
            const command = preparedCommands[i];
            commandPromises.push(command.execute());
        }
        await Promise.all(commandPromises);

        await coupler.isDone;
    }
}