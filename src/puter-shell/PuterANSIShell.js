import { Pipeline } from "../ansi-shell/pipeline/Pipeline";
import { readtoken, TOKENS } from "../ansi-shell/readtoken";

export class PuterANSIShell extends EventTarget {
    constructor (ctx) {
        super();

        this.ctx = ctx;
        this.variables_ = {};
        this.config = ctx.externs.config;

        const self = this;
        this.variables = new Proxy(this.variables_, {
            get (target, k) {
                return Reflect.get(target, k);
            },
            set (target, k, v) {
                const oldval = target[k];
                const retval = Reflect.set(target, k, v);
                self.dispatchEvent(new CustomEvent('shell-var-change', {
                    key: k,
                    oldValue: oldval,
                    newValue: target[k],
                }))
                return retval;
            }
        })

        this.addEventListener('signal.window-resize', evt => {
            this.variables.size = evt.detail;
        })

        this.env = {};

        this.initializeReasonableDefaults();
    }

    export_ (k, v) {
        this.env[k] = v;
    }

    initializeReasonableDefaults() {
        const home = '/' + this.config['puter.auth.username'];
        const user = this.config['puter.auth.username'];
        this.variables.pwd = home;

        // Computed values
        Object.defineProperty(this.env, 'PWD', {
            enumerable: true,
            get: () => this.variables.pwd,
            set: v => this.variables.pwd = v
        })
        Object.defineProperty(this.env, 'ROWS', {
            enumerable: true,
            get: () => this.variables.size?.rows ?? 0
        })
        Object.defineProperty(this.env, 'COLS', {
            enumerable: true,
            get: () => this.variables.size?.cols ?? 0
        })

        // Default values
        this.export_('HOME', home);
        this.export_('USER', user);
        this.export_('TERM', 'xterm-256color');
        this.export_('TERM_PROGRAM', 'puter-ansi');
        this.export_('PS1', '[\\u@puter.com \\w]\\$ ');
        // TODO: determine how localization will affect this
        this.export_('LANG', 'en_US.UTF-8');
        // TODO: add TERM_PROGRAM_VERSION
        // TODO: add OLDPWD
    }

    async doPromptIteration() {
        console.log('prompt iteration');
        const { readline } = this.ctx.externs;
        // DRY: created the same way in runPipeline
        const executionCtx = this.ctx.sub({
            vars: this.variables,
            env: this.env,
            locals: {
                pwd: this.variables.pwd,
            }
        });
        const input = await readline(
            this.expandPromptString(this.env.PS1),
            executionCtx,
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
            env: this.env,
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
