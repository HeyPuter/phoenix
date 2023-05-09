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
        const { readline } = this.ctx.externs;
        const input = await readline(
            this.expandPromptString(this.env.PS1)
        );
        // TODO: add proper tokenizer
        const tokens = input.split(' ');
        
        await this.runCommand(tokens);
    }

    async runCommand (cmdOrTokens) {
        const tokens = typeof cmdOrTokens === 'string'
            ? this.tokenize(cmdOrTokens)
            : cmdOrTokens ;

        const cmd = tokens.shift();

        const { commands, argparsers } = this.ctx.registries;
        const { ptt } = this.ctx.externs;
        
        if ( ! commands.hasOwnProperty(cmd) ) {
            ptt.out.write(`no command: ${JSON.stringify(cmd)}\n`);
            return;
        }
        const command = commands[cmd];

        const ctx = {
            ...this.ctx,
            vars: this.variables,
            externs: {
                in: ptt.in,
                out: ptt.out,
            },
            locals: {
                command,
                args: tokens,
                valid: true,
            }
        };
        if ( command.args ) {
            const argProcessorId = command.args.$;
            const argProcessor = argparsers[argProcessorId];
            const spec = { ...command.args };
            delete spec.$;
            argProcessor.process(ctx, spec);
        }
        if ( ! ctx.locals.valid ) return;
        await command.invoke(ctx);
    }

    tokenize (cmdString) {
        return cmdString.split(' ');
    }

    expandPromptString (str) {
        str = str.replace('\\u', this.config['puter.auth.username']);
        str = str.replace('\\w', this.variables.pwd);
        str = str.replace('\\$', '$');
        return str;
    }
}