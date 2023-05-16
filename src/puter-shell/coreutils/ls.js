// INCONST: called 'path' instead of 'path_' elsewhere
import path_ from "path-browserify";

export default {
    name: 'ls',
    args: {
        $: 'simple-parser',
        allowPositionals: true,
        options: {
            all: {
                type: 'boolean',
                short: 'a'
            }
        }
    },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values, pwd } = ctx.locals;
        const { puterShell } = ctx.externs;

        const paths = positionals.length < 1
            ? [pwd] : positionals ;


        // DRY: also done in mkdir, cat, and mv
        const resolve = relPath => {
            if ( relPath.startsWith('/') ) {
                return relPath;
            }
            return path_.resolve(ctx.vars.pwd, relPath);
        }

        const showHeadings = paths.length > 1 ? async ({ i, path }) => {
            if ( i !== 0 ) ctx.externs.out.write('\n');
            await ctx.externs.out.write(path + ':\n');
        } : () => {};
        
        for ( let i=0 ; i < paths.length ; i++ ) {
            let path = paths[i];
            await showHeadings({ i, path });
            path = resolve(path);
            const result = await puterShell.command('list', { path });
            for ( const item of result ) {
                await ctx.externs.out.write(item.name + '\n');
            }
        }
    }
};
