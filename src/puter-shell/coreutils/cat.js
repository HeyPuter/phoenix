import path from "path-browserify";

export default {
    name: 'cat',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    input: {
        syncLines: true,
    },
    output: 'text',
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        const paths = [...positionals];
        if ( paths.length < 1 ) paths.push('-');

        for ( const relPath of paths ) {
            if ( relPath === '-' ) {
                let line, done;
                const next_line = async () => {
                    ({ value: line, done } = await ctx.externs.in_.read());
                    console.log('CAT LOOP', { line, done });
                }
                for ( await next_line() ; ! done ; await next_line() ) {
                    await ctx.externs.out.write(line);
                }
                continue;
            }
            // DRY: also done in mkdir
            const absPath = relPath.startsWith('/') ? relPath :
                path.resolve(ctx.vars.pwd, relPath);

            const result = await filesystem.read(absPath);

            await ctx.externs.out.write(result);
        }
    }
}