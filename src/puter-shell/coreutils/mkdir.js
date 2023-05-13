import path from "path-browserify";

// DRY: very similar to `cd`
export default {
    name: 'mkdir',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            parents: {
                type: 'boolean',
                short: 'p'
            }
        }
    },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values } = ctx.locals;
        const { puterShell } = ctx.externs;

        let [ target ] = positionals;

        if ( ! target.startsWith('/') ) {
            target = path.resolve(ctx.vars.pwd, target);
        }

        const result = await puterShell.command('mkdir', { path: target });

        if ( result.$ === 'error' ) {
            ctx.externs.err.write('mkdir: error: ' + result.message + '\n');
            return;
        }
    }
};

