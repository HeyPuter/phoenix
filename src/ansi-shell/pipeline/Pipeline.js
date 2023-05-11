import { TOKENS } from "../readtoken";
import { Coupler } from "./Coupler";
import { CommandStdinDecorator } from "./iowrappers";
import { Pipe } from "./Pipe";

// TODO: move to a utility module
const splitArray = (items, delimiter) => {
    const result = [];
    {
        let buffer = [];
        // single pass to split by pipe token
        for ( let i=0 ; i < items.length ; i++ ) {
            if ( items[i] === delimiter ) {
                result.push(buffer);
                buffer = [];
                continue;
            }

            buffer.push(items[i]);
        }

        if ( buffer.length !== 0 ) {
            result.push(buffer);
        }
    }
    return result;
};

export class PreparedCommand {
    static createFromTokens (ctx, tokens) {
        const cmd = tokens[0];
        const args = tokens.slice(1);

        const { commands } = ctx.registries;

        console.log('will err happen?', cmd)
        if ( ! commands.hasOwnProperty(cmd) ) {
            console.log('this error is happen')
            throw new Error('no command: ' + JSON.stringify(cmd));
        }

        const command = commands[cmd];

        return new PreparedCommand({
            command, args
        });
    }

    constructor ({ command, args }) {
        this.command = command;
        this.args = args;
    }

    setContext (ctx) {
        this.ctx = ctx;
    }

    async execute () {
        const { command, args } = this;

        const { argparsers } = this.ctx.registries;

        const ctx = this.ctx.sub({
            externs: {
                in_: new CommandStdinDecorator(this.ctx.externs.in_)
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
            console.log({
                argparsers, argProcessorId
            });
            const spec = { ...command.args };
            delete spec.$;
            console.log('calling argprocessor process');
            argProcessor.process(ctx, spec);
        }

        if ( ! ctx.cmdExecState.valid ) {
            console.log('parse not valid??')
            ctx.locals.exit = -1;
            return;
        }
        console.log('executing the command', command)
        await command.execute(ctx);

        // ctx.externs.in?.close?.();
        // ctx.externs.out?.close?.();
        ctx.externs.out.close();
    }
}

export class Pipeline {
    static createFromTokens (ctx, tokens) {
        const preparedCommands = [];

        const tokensGroupedByCommand = splitArray(tokens, TOKENS['|']);
        console.log(JSON.stringify(tokensGroupedByCommand, undefined, '  '));
        for ( const cmdTokens of tokensGroupedByCommand ) {
            console.log('trying a command', cmdTokens);
            const command = PreparedCommand.createFromTokens(ctx, cmdTokens);
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

        console.log('preparedCommands', preparedCommands);

        for ( let i=0 ; i < preparedCommands.length ; i++ ) {
            const command = preparedCommands[i];
            const cmdCtx = { externs: { in_: nextIn } };

            const pipe = new Pipe();
            lastPipe = pipe;
            cmdCtx.externs.out = pipe.in;
            nextIn = pipe.out;

            // TODO: need to consider redirect from out to err
            cmdCtx.externs.err = ctx.externs.out;
            command.setContext(ctx.sub(cmdCtx));
        }


        new Coupler(lastPipe.out, ctx.externs.out);

        const commandPromises = [];
        for ( let i = preparedCommands.length - 1 ; i >= 0 ; i-- ) {
            const command = preparedCommands[i];
            console.log('going to call start on: ', command)
            commandPromises.push(command.execute());
        }
        await Promise.all(commandPromises);
    }
}