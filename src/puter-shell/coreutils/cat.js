import path from "path-browserify";

export default {
    name: 'cat',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { puterShell } = ctx.externs;

        for ( const relPath of positionals ) {
            // DRY: also done in mkdir
            const absPath = relPath.startsWith('/') ? relPath :
                path.resolve(ctx.vars.pwd, relPath);

            const result = await puterShell.command(
                'call-puter-api', {
                    command: 'read',
                    params: { path: absPath }
                }
            );
            
            if ( result.$ === 'error' ) {
                ctx.externs.err.write('cat: error: ' + result.message + '\n');
                return;
            }

            ctx.externs.out.write(result.message);
        }
    }
}