import path from "path-browserify";

// TODO: add logic to check if directory is empty
// TODO: add check for `--dir`
// TODO: allow multiple paths

// DRY: very similar to `cd`
export default {
    name: 'rmdir',
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
        const { filesystem } = ctx.platform;

        let [ target ] = positionals;

        if ( ! target.startsWith('/') ) {
            target = path.resolve(ctx.vars.pwd, target);
        }

        await filesystem.rmdir(target);
    }
};
