import path_ from "path-browserify";

export default {
    name: 'touch',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { positionals } = ctx.locals;
        const { puterShell } = ctx.externs;

        if ( positionals.length === 0 ) {
            await ctx.externs.err.write('touch: missing file operand');
            return;
        }

        // DRY: also done in mkdir, cat, mv, and ls
        const resolve = relPath => {
            if ( relPath.startsWith('/') ) {
                return relPath;
            }
            return path_.resolve(ctx.vars.pwd, relPath);
        }

        for ( let i=0 ; i < positionals.length ; i++ ) {
            const path = resolve(positionals[i]);
            const result = await puterShell.command(
                'call-puter-api',
                { command: 'stat', params: { path } }
            );
            // await ctx.externs.out.write(
            //     JSON.stringify(result, undefined, '  ')
            // );
            if ( ! result?.$ === 'error' ) continue;

            const file = new Blob(['']);

            // DRY: similar concern in: mv
            const dstPath = path_.dirname(path);
            const dstName = path_.basename(path);

            await puterShell.command(
                'call-puter-api',
                {
                    command: 'write',
                    params: {
                        path: dstPath,
                        name: dstName,
                        file,
                        overwrite: false,
                    }
                }
            );
        }
    }
}
