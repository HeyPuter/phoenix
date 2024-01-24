import path from "path-browserify";

// TODO: add logic to check if directory is empty
// TODO: add check for `--dir`
// TODO: allow multiple paths

// DRY: very similar to `cd`
export default {
    name: 'rm',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            dir: {
                type: 'boolean',
                short: 'd'
            },
            recursive: {
                type: 'boolean',
                short: 'r'
            },
            force: {
                type: 'boolean',
                short: 'f'
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

        const stat = await puterShell.command('stat', { path: target });
        console.log('stat?', stat);

        if ( stat.$ === 'error' ) {
            ctx.externs.err.write('rm: stat: error: ' + stat.message + '\n');
            return;
        }

        if ( ! values.recursive ) {
            if ( stat.is_dir ) {
                ctx.externs.err.write(
                    `rm: cannot remove '${target}': Is a directory\n`);
                return;
            }
        }

        const result = await puterShell.command(
            'fs:delete',
            {
                path: target
            }
        );

        if ( result.$ === 'error' ) {
            ctx.externs.err.write('rm: error: ' + result.message + '\n');
            return;
        }
    }
};


