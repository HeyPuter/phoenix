import { Pipeline } from "../ansi-shell/pipeline/Pipeline";
import { readtoken, TOKENS } from "../ansi-shell/readtoken";

export class PuterANSIShell {
    constructor (ctx) {
        this.ctx = ctx;
        this.variables = {};
        this.config = ctx.externs.config;

        this.env = {};

        this.initializeReasonableDefaults();
    }

    export_ (k, v) {
        this.env[k] = v;
    }

    initializeReasonableDefaults() {
        const home = '/' + this.config['puter.auth.username'];
        this.variables.pwd = home;

        // Computed values
        Object.defineProperty(this.env, 'PWD', {
            get: () => this.variables.pwd,
            set: v => this.variables.pwd = v
        })

        // Default values
        this.export_('HOME', home);
        this.export_('PS1', '[\\u@puter.com \\w]\\$ ');
    }

    async doPromptIteration() {
        console.log('prompt iteration');
        const { readline } = this.ctx.externs;
        const input = await readline(
            this.expandPromptString(this.env.PS1)
        );
        
        await this.runPipeline(input);
    }

    async runPipeline (cmdOrTokens) {
        const tokens = typeof cmdOrTokens === 'string'
            ? readtoken(cmdOrTokens)
            : cmdOrTokens ;

        if ( tokens.length === 0 ) return;
        
        let pipeline;
        try {
            pipeline = Pipeline.createFromTokens(this.ctx, tokens);
        } catch (e) {
            this.ctx.externs.out.write('error: ' + e.message + '\n');
            return;
        }
        

        const executionCtx = this.ctx.sub({
            vars: this.variables,
            locals: {
                pwd: this.variables.pwd,
            }
        });
        
        await pipeline.execute(executionCtx);

        // const cmd = tokens.shift();

        // const { commands, argparsers } = this.ctx.registries;
        // const { out } = this.ctx.externs;
        
        // if ( ! commands.hasOwnProperty(cmd) ) {
        //     out.write(`no command: ${JSON.stringify(cmd)}\n`);
        //     return;
        // }
        // const command = commands[cmd];

        // const ctx = this.ctx.sub({
        //     vars: this.variables,
        //     locals: {
        //         pwd: this.variables.pwd,
        //         command,
        //         args: tokens,
        //         valid: true,
        //     }
        // });

        // // const ctx = {
        // //     ...this.ctx,
        // //     vars: this.variables,
        // //     externs: {
        // //         in: ptt.in,
        // //         out: ptt.out,
        // //         puterShell: this.ctx.externs.puterShell,
        // //     },
        // // };
        // if ( command.args ) {
        //     const argProcessorId = command.args.$;
        //     const argProcessor = argparsers[argProcessorId];
        //     const spec = { ...command.args };
        //     delete spec.$;
        //     argProcessor.process(ctx, spec);
        // }
        // if ( ! ctx.locals.valid ) return;
        // await command.execute(ctx);
    }

    async createPipeline (tokens) {
        const commands = [];

        let buffer = [];
        // single pass to split by pipe token
        for ( let i=0 ; i < tokens.length ; i++ ) {
            if ( tokens[i] === TOKENS['|'] ) {
                commands.push(buffer);
                buffer = [];
                continue;
            }

            buffer.push(tokens[i]);
        }
    }

    expandPromptString (str) {
        str = str.replace('\\u', this.config['puter.auth.username']);
        str = str.replace('\\w', this.variables.pwd);
        str = str.replace('\\$', '$');
        return str;
    }

    async outputANSI (ctx) {
        await ctx.iterate(async item => {
            ctx.externs.out.write(item.name + '\n');
        });
    }
}
