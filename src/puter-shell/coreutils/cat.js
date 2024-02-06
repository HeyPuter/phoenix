import path from "path-browserify";

export default {
    name: 'cat',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    output: 'text',
    execute: async ctx => {
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        for ( const relPath of positionals ) {
            // DRY: also done in mkdir
            const absPath = relPath.startsWith('/') ? relPath :
                path.resolve(ctx.vars.pwd, relPath);

            const result = await filesystem.read(absPath);

            await ctx.externs.out.write(result);
        }
    }
}